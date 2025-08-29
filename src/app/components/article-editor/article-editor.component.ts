import {Component, ElementRef, ViewChild, OnInit, signal, input, PLATFORM_ID, inject, output} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {isPlatformBrowser} from '@angular/common';
import {SaveToGithubService} from '../../services/saveToGithub';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';

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
  readonly #githubSave = inject(SaveToGithubService);
  readonly #router = inject(Router);
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
          reject(new Error('Failed to upload image'));
        }
      });
    });
  }

  convertMdxToEditorBlocks(mdx: string): any {
    const lines = mdx.split('\n');
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

  convertToMDX(data: any): string {
    return data.blocks
      .map((block: any) => {
        if (block.type === 'header') {
          return `${'#'.repeat(block.data.level)} ${block.data.text}`;
        } else if (block.type === 'paragraph') {
          return block.data.text;
        } else if (block.type === 'image') {
          const caption = block.data.caption ? ` "${block.data.caption}"` : '';
          return `![${block.data.caption || 'Image'}](${block.data.file.url}${caption})`;
        }
        return '';
      })
      .join('\n\n');
  }

  close() {
    this.#router.navigate([], {
      queryParams: { editor: null }
    });
  }

  async saveToGithub() {
    const saved = await this.editor.save();
    const mdx = this.convertToMDX(saved);

    const path = this.newPath() || this.articlePath();

    this.#githubSave.saveFile(path, mdx, null ).subscribe({
      next: () => console.log('✅ File saved'),
      error: (err) => console.error('❌ Save failed', err),
    });
    alert('Opgeslagen');

  }
}
