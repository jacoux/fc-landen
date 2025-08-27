import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService } from '../../services/blog.service';
import { RecentArticleMeta } from '../../types/Article.types';

@Component({
  selector: 'app-article-latest',
  imports: [CommonModule],
  templateUrl: './article-latest.component.html',
})

export class ArticleLatestComponent implements OnInit {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly articlePaths = input<string[]>();

  readonly recentArticles = signal<RecentArticleMeta[]>([]);

  readonly #blogService = inject(BlogService);

  ngOnInit(): void {
    const paths = this.articlePaths();
    if (paths && paths.length > 0) {
      for (const articlePath of paths) {
        this.#blogService.getPostHeader(articlePath).subscribe((data: RecentArticleMeta) => {
          const { excerpt, title, author, date, sections, tags, image, slug } = data;
          this.recentArticles.update((articles) => [...articles, { excerpt, title, author, date, sections, tags, image, slug }]);
        });
      }
    }
  }
}


