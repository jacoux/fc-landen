import {Component, ElementRef, ViewChild, OnInit, signal, input, PLATFORM_ID, inject, output} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {isPlatformBrowser} from '@angular/common';
import {SaveToGithubService} from '../../services/saveToGithub';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {SliderTool} from './slider-tool';
import {DeployNotificationService} from '../../services/deploy-notification.service';

@Component({
  selector: 'app-article-editor',
  templateUrl: './article-editor.component.html',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  standalone: true
})
export class ArticleEditorComponent implements OnInit {
  @ViewChild('editorRoot', { static: true }) editorRoot!: ElementRef;
  private readonly platformId = inject(PLATFORM_ID);
  readonly articlePath = input.required<string>();
  newPath = signal('');
  editor: any;
  markdownContent = output<string>();

  // Frontmatter fields
  frontmatter = signal({
    title: '',
    author: '',
    date: '',
    image: '',
    slug: '',
    excerpt: '',
    tags: [] as string[],
    sections: ''
  });

  readonly #githubSave = inject(SaveToGithubService);
  readonly #router = inject(Router);
  readonly #deployNotification = inject(DeployNotificationService);
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMdxFile(this.articlePath());
  }

  loadMdxFile(path: string) {
    this.http.get(path, { responseType: 'text' }).subscribe(async (mdxContent) => {
      const blocks = this.convertMdxToEditorBlocks(mdxContent);
      await this.initEditor(blocks);
    });
  }

  async initEditor(blockData: any) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const EditorJS = (await import('@editorjs/editorjs')).default;
    const Header = (await import('@editorjs/header')).default;
    const Paragraph = (await import('@editorjs/paragraph')).default;
    const Image = (await import('@editorjs/image')).default;

    this.editor = new EditorJS({
      holder: this.editorRoot.nativeElement,
      data: blockData,
      tools: {
        header: Header,
        paragraph: Paragraph,
        image: {
          class: Image,
          config: {
            uploader: {
              uploadByFile: (file: File) => {
                return this.uploadImageFile(file);
              }
            }
          }
        },
        slider: {
          class: SliderTool,
          config: {
            uploader: {
              uploadByFile: (file: File) => {
                return this.uploadImageFile(file);
              }
            }
          }
        }
      },
      onChange: async () => {
        const newData = await this.editor.save();
        this.markdownContent.emit(this.convertToMDX(newData));
      },
    });
  }

  uploadImageFile(file: File): Promise<{success: number, file: {url: string}}> {
    return new Promise((resolve, reject) => {
      this.#githubSave.uploadImage(file).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          console.error('Image upload failed:', error);
          console.error('Full error details:', JSON.stringify(error, null, 2));
          reject(error);
        }
      });
    });
  }

  convertMdxToEditorBlocks(mdx: string): any {
    const { frontmatter, content } = this.parseFrontmatter(mdx);

    // Update frontmatter signal
    this.frontmatter.set(frontmatter);

    const lines = content.split('\n');
    const blocks: any[] = [];

    for (const line of lines) {
      if (line.startsWith('# ')) {
        blocks.push({ type: 'header', data: { text: line.slice(2), level: 1 } });
      } else if (line.startsWith('## ')) {
        blocks.push({ type: 'header', data: { text: line.slice(3), level: 2 } });
      } else if (line.trim()) {
        blocks.push({ type: 'paragraph', data: { text: line.trim() } });
      }
    }

    return { blocks };
  }

  parseFrontmatter(mdx: string): { frontmatter: any, content: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = mdx.match(frontmatterRegex);

    if (!match) {
      return {
        frontmatter: {
          title: '',
          author: '',
          date: '',
          image: '',
          slug: '',
          excerpt: '',
          tags: [],
          sections: ''
        },
        content: mdx
      };
    }

    const frontmatterText = match[1];
    const content = match[2];

    // Parse YAML-like frontmatter
    const frontmatter: any = {
      title: '',
      author: '',
      date: '',
      image: '',
      slug: '',
      excerpt: '',
      tags: [],
      sections: ''
    };

    const lines = frontmatterText.split('\n');
    let currentKey = '';
    let inTagsSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine === 'tags:') {
        inTagsSection = true;
        currentKey = 'tags';
        continue;
      }

      if (trimmedLine.startsWith('- ') && inTagsSection) {
        frontmatter.tags.push(trimmedLine.slice(2).trim());
        continue;
      }

      if (trimmedLine.includes(':')) {
        inTagsSection = false;
        const [key, ...valueParts] = trimmedLine.split(':');
        const value = valueParts.join(':').trim();
        currentKey = key.trim();

        if (currentKey in frontmatter) {
          frontmatter[currentKey] = value;
        }
      }
    }

    return { frontmatter, content };
  }

  convertToMDX(data: any): string {
    const fm = this.frontmatter();

    // Build frontmatter
    let frontmatterText = '---\n';
    frontmatterText += `title: ${fm.title}\n`;
    frontmatterText += `author: ${fm.author}\n`;
    frontmatterText += `date: ${fm.date}\n`;
    frontmatterText += `image: ${fm.image}\n`;
    frontmatterText += `slug: ${fm.slug}\n`;
    frontmatterText += `excerpt: ${fm.excerpt}\n`;

    if (fm.tags.length > 0) {
      frontmatterText += 'tags:\n';
      for (const tag of fm.tags) {
        frontmatterText += `- ${tag}\n`;
      }
    }

    if (fm.sections) {
      frontmatterText += `sections: ${fm.sections}\n`;
    }

    frontmatterText += '---\n\n';

    // Build content
    const content = data.blocks
      .map((block: any) => {
        if (block.type === 'header') {
          return `${'#'.repeat(block.data.level)} ${block.data.text}`;
        } else if (block.type === 'paragraph') {
          return block.data.text;
        } else if (block.type === 'image') {
          const caption = block.data.caption ? ` "${block.data.caption}"` : '';
          return `![${block.data.caption || 'Image'}](${block.data.file.url}${caption})`;
        } else if (block.type === 'slider') {
          return this.convertSliderToMarkdown(block.data);
        }
        return '';
      })
      .join('\n\n');

    return frontmatterText + content;
  }

  updateFrontmatterField(field: string, value: any) {
    const current = this.frontmatter();
    this.frontmatter.set({ ...current, [field]: value });
  }

  addTag() {
    const current = this.frontmatter();
    this.frontmatter.set({ ...current, tags: [...current.tags, ''] });
  }

  updateTag(index: number, value: string) {
    const current = this.frontmatter();
    const newTags = [...current.tags];
    newTags[index] = value;
    this.frontmatter.set({ ...current, tags: newTags });
  }

  removeTag(index: number) {
    const current = this.frontmatter();
    const newTags = current.tags.filter((_, i) => i !== index);
    this.frontmatter.set({ ...current, tags: newTags });
  }

  convertSliderToMarkdown(sliderData: any): string {
    // Extract image URLs from the slider data
    const imageUrls = sliderData.images.map((img: any) => img.url);

    // Create a JSON string of the image URLs array
    const imagesJson = JSON.stringify(imageUrls);

    // Return the [appLogos] placeholder with the images data
    return `[appLogos ${imagesJson}]`;
  }

  close() {
    this.#router.navigate([], {
      queryParams: { editor: null }
    });
    this.loadMdxFile(this.articlePath());
  }

  uploadFrontmatterImage(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      this.uploadImageFile(file).then(response => {
        this.updateFrontmatterField('image', response.file.url);
        fileInput.value = '';
      }).catch(error => {
        console.error('Failed to upload image:', error);
      });
    }
  }

  async saveToGithub() {
    const saved = await this.editor.save();
    const mdx = this.convertToMDX(saved);

    const path = this.newPath() || this.articlePath();

    this.#githubSave.saveFile(path, mdx, null ).subscribe({
      next: () => {
        console.log('✅ File saved');
        this.close();
        this.#deployNotification.startDeployCountdown();
      },
      error: (err) => alert('❌ Er ging iets mis bij het opslaan: ' + err.message),
    });
  }
}
