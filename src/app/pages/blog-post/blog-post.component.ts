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
    this.markdownPath.set('assets/blog/eten-en-drinken/mealprepping.md');
  }

  ngOnInit(): void {
    const category = this.route.snapshot.paramMap.get('category');
    const postName = this.route.snapshot.paramMap.get('postName');
    const isNewPostRoute = this.route.snapshot.url.some(segment => segment.path === 'nieuw');
    const currentUrl = this.route.snapshot.url.map(segment => segment.path).join('/');

    if (category && postName) {
      // Original dynamic blog post loading (blog/:category/:postName)
      const fullMarkdownPath = `assets/blog/${category}/${postName}.md`;
      this.loadMarkdownContent(fullMarkdownPath);
    } else if (isNewPostRoute) {
      // New blog post route
      this.title.set('Nieuwe blog post');
      this.author.set('FC Landen');
      this.sections.set(['nieuw']);
      this.date.set(new Date().toLocaleDateString());
      this.excerpt.set('Begin hier met het schrijven van je nieuwe blog post...');
      this.content.set('# Titel van je nieuwe blog post\n\nBegin hier met schrijven...');
      this.markdownPath.set('');
    } else if (currentUrl) {
      // FC Landen navigation routes - map URL directly to markdown file path
      const markdownPath = this.mapUrlToMarkdownPath(currentUrl);
      if (markdownPath) {
        this.loadMarkdownContent(markdownPath);
      } else {
        console.warn('No markdown file found for URL:', currentUrl);
        this.loadFallbackContent(currentUrl);
      }
    } else {
      console.warn('Blog post category or name missing from route parameters, and not the new post page.');
    }
  }

  private mapUrlToMarkdownPath(url: string): string | null {
    // Map FC Landen navigation URLs to their corresponding markdown files
    const pathMappings: { [key: string]: string } = {
      // Clubinfo routes
      'clubinfo/clubgegevens': 'assets/blog/clubinfo/www_fclanden_be_clubinfo_clubgegevens.md',
      'clubinfo/visie': 'assets/blog/clubinfo/www_fclanden_be_clubinfo_visie.md',
      'clubinfo/organogram': 'assets/blog/clubinfo/www_fclanden_be_clubinfo_organogram.md',
      'clubinfo/infrastructuur': 'assets/blog/clubinfo/www_fclanden_be_clubinfo_infrastructuur.md',
      'clubinfo/route': 'assets/blog/clubinfo/www_fclanden_be_clubinfo_route.md',
      'clubinfo/contact': 'assets/blog/clubinfo/www_fclanden_be_clubinfo_contact.md',
      'clubinfo/intern-reglement': 'assets/blog/clubinfo/www_fclanden_be_clubinfo_intern-reglement.md',
      'clubinfo/privacy': 'assets/blog/clubinfo/www_fclanden_be_clubinfo_privacy.md',

      // Jeugdvoetbal routes
      'jeugdvoetbal': 'assets/blog/jeugdvoetbal/www_fclanden_be_jeugdvoetbal.md',
      'ongevallen': 'assets/blog/www_fclanden_be_ongevallen.md',

      // Lid worden routes
      'lid-worden': 'assets/blog/jeugdvoetbal/www_fclanden_be_lid-worden.md',
      'lid-worden/visie-jeugd': 'assets/blog/jeugdvoetbal/www_fclanden_be_lid-worden_visie-jeugd.md',
      'lid-worden/doorstroming': 'assets/blog/jeugdvoetbal/www_fclanden_be_lid-worden_doorstroming.md',
      'lid-worden/ethiek-en-fairplay': 'assets/blog/jeugdvoetbal/www_fclanden_be_lid-worden_ethiek-en-fairplay.md',
      'lid-worden/organogram-jeugd': 'assets/blog/jeugdvoetbal/www_fclanden_be_lid-worden_organogram-jeugd.md',
      'lid-worden/come-together': 'assets/blog/jeugdvoetbal/www_fclanden_be_lid-worden_come-together.md',

      // Ledeninfo routes
      'ledeninfo': 'assets/blog/ledeninfo/www_fclanden_be_ledeninfo.md',
      'ledeninfo/prosoccerdata': 'assets/blog/ledeninfo/www_fclanden_be_ledeninfo_prosoccerdata.md',
      'ledeninfo/huisregels': 'assets/blog/ledeninfo/www_fclanden_be_ledeninfo_huisregels.md',
      'ledeninfo/attesten-mutualiteit': 'assets/blog/ledeninfo/www_fclanden_be_ledeninfo_attesten-mutualiteit.md',
      'ledeninfo/gezinskorting': 'assets/blog/ledeninfo/www_fclanden_be_ledeninfo_gezinskorting.md',
      'ledeninfo/ehbso': 'assets/blog/ledeninfo/www_fclanden_be_ledeninfo_ehbso.md',
      'ledeninfo/lifestyle': 'assets/blog/ledeninfo/www_fclanden_be_ledeninfo_lifestyle.md',
      'ledeninfo/sportvoeding': 'assets/blog/ledeninfo/www_fclanden_be_ledeninfo_sportvoeding.md',
      'ledeninfo/club-api': 'assets/blog/algemeen/www_fclanden_be_club-api.md',

      // Other routes
      'wedstrijdinfo': 'assets/blog/algemeen/www_fclanden_be_wedstrijdinfo.md',
      'techniek': 'assets/blog/algemeen/www_fclanden_be_techniek.md',
      'sponsoren': 'assets/blog/algemeen/www_fclanden_be_sponsoren.md',
      'club-api': 'assets/blog/algemeen/www_fclanden_be_club-api.md',
      'word-medewerker': 'assets/blog/algemeen/www_fclanden_be_medewerker-worden.md'
    };

    return pathMappings[url] || null;
  }

  private loadMarkdownContent(markdownPath: string): void {
    this.markdownPath.set(markdownPath);
    console.log('Loading markdown file:', markdownPath);

    this.blogService.loadMarkdown(markdownPath).subscribe({
      next: (result: MarkdownResult) => {
        this.content.set(result.content);
      },
      error: err => {
        console.error('Error loading markdown:', err);
        this.loadFallbackContent(markdownPath);
      }
    });

    this.blogService.getPostHeader(markdownPath).subscribe({
      next: (data) => {
        this.title.set(data.title || 'FC Landen');
        this.author.set(data.author || 'FC Landen');
        this.sections.set(data.sections || []);
        this.date.set(data.date || new Date().toLocaleDateString());
        this.excerpt.set(data.excerpt || '');
      },
      error: err => {
        console.error('Error loading post header:', err);
        // Set fallback values
        this.title.set('FC Landen');
        this.author.set('FC Landen');
        this.sections.set([]);
        this.date.set(new Date().toLocaleDateString());
        this.excerpt.set('');
      }
    });
  }

  private loadFallbackContent(path: string): void {
    // Fallback content when markdown file is not found
    const pathSegments = path.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    const title = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');

    this.title.set(title);
    this.author.set('FC Landen');
    this.content.set(`# ${title}\n\nContent voor deze pagina wordt binnenkort toegevoegd.\n\nBezoek onze andere secties om meer te leren over FC Landen.`);
    this.date.set(new Date().toLocaleDateString());
    this.excerpt.set(`Informatie over ${title.toLowerCase()}`);
  }

  onBlockUpdate($event: string) {
    const strippedCt = stripMetadata($event);
    this.newContent.set(strippedCt);
  }
}
