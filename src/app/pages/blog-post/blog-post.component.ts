import {Component, input, OnInit, signal} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import {HttpClient, provideHttpClient, withFetch} from '@angular/common/http';
import { MarkdownDirective } from '../../directives/mardown.directive';
import {BlogService, MarkdownResult} from '../../services/blog.service';
import {BlogHeaderComponent} from '../../ui/blog-header/blog-header.component';
import matter from 'gray-matter';
import {ArticleEditorComponent} from '../../components/article-editor/article-editor.component';
import {EditorDirective} from '../../directives/editor.directive';
import {EditorModeDirective} from '../../directives/articleEditor.directive';
import {SidebarEditorComponent} from '../../components/sidebar-editor/sidebar-editor.component';
import {stripMetadata} from '../../metadata.util';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [MarkdownModule, MarkdownDirective, BlogHeaderComponent, ArticleEditorComponent, EditorModeDirective, FormsModule],
  providers: [
    provideMarkdown()
  ],
  templateUrl: 'blog-post.component.html',
  styleUrl: './blog-post.component.scss'
})
export class BlogPostComponent implements OnInit {
  markdownPath = signal('');
  title = signal('');
  author = signal('Jill Pairoux');
  date = signal('');
  excerpt = signal('');
  sections = signal<string[]>([]);
  content = signal<string>('');
  newContent = signal('');

  constructor(private readonly route: ActivatedRoute, private readonly blogService: BlogService) {
    this.markdownPath.set('assets/blog/algemeen/fc-landen-kampioen-2a.md');
  }

  ngOnInit(): void {
    const category = this.route.snapshot.paramMap.get('category');
    const postName = this.route.snapshot.paramMap.get('postName');
    const isNewPostRoute = this.route.snapshot.url.some(segment => segment.path === 'nieuw');
    if (category && postName) {
      const fullMarkdownPath = `assets/blog/${category}/${postName}.md`;
      this.markdownPath.set(fullMarkdownPath);
      console.log('Laden blog post:', fullMarkdownPath);
      this.blogService.loadMarkdown(fullMarkdownPath).subscribe({
        next: (result: MarkdownResult) => {
          this.content.set(result.content);
        },
        error: err => console.error('Fout bij laden Markdown:', err)
      });

      this.blogService.getPostHeader(fullMarkdownPath).subscribe((data) => {
        this.title.set(data.title);
        this.author.set(data.author);
        this.sections.set(data.sections);
        this.date.set(data.date);
        this.excerpt.set(data.excerpt);
      });
    } else if (isNewPostRoute) {
      this.title.set('Nieuwe blog post');
      this.author.set('FC Landen');
      this.sections.set(['nieuw']);
      this.date.set(new Date().toLocaleDateString());
      this.excerpt.set('Begin hier met het schrijven van je nieuwe blog post...');
      this.content.set('# Titel van je nieuwe blog post\n\nBegin hier met schrijven...');
      this.markdownPath.set('');
    } else {
      console.warn('Blog post category or name missing from route parameters, and not the new post page.');
    }
  }

  onBlockUpdate($event: string) {
    const strippedCt = stripMetadata($event);
    this.newContent.set(strippedCt);
  }
}
