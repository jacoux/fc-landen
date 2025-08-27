import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { parse as parseYAML } from 'yaml';
import { RecentArticleMeta } from '../types/Article.types';

export interface BlogPost {
  title: string;
  excerpt: string;
  tags: string[];
  sections: string[];
  content: string;
  slug: string;
  image: string;
  author: string;
  date: string;
}

export interface MarkdownResult {
  content: string; // de markdown zonder frontmatter
  metadata: { [key: string]: any }; // de frontmatter als object
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private blogFiles = ['assets/blog/mealprepping.md'];

  constructor(private readonly http: HttpClient) {}

  getAllPosts(): Observable<BlogPost[]> {
    const requests = this.blogFiles.map((file) =>
      this.http.get(file, { responseType: 'text' }).pipe(
        map((content) => this.parseMarkdown(content, file))
      )
    );

    return forkJoin(requests);
  }

  getPostsByTag(tag: string): Observable<BlogPost[]> {
    return this.getAllPosts().pipe(
      map((posts) => posts.filter((post) => post.tags.includes(tag)))
    );
  }

  getPostHeader(slug: string): Observable<RecentArticleMeta> {
    const filePath = slug;
    return this.http.get(filePath, { responseType: 'text' }).pipe(
      map((content) => {
        const match = /^---\n([\s\S]+?)\n---\n/.exec(content);
        let frontmatter: any = {};

        if (match) {
          frontmatter = parseYAML(match[1]);
        } else {
          console.warn(`Geen frontmatter gevonden in ${filePath}`);
        }

        return {
          title: frontmatter.title ?? 'Geen titel',
          author: frontmatter.author ?? 'FC Landen',
          date: frontmatter.date ?? 'Geen datum',
          slug: frontmatter.slug ?? 'Geen slug',
          image:
            frontmatter.image ??
            'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=3477&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          excerpt: frontmatter.excerpt ?? '',
          tags: frontmatter.tags ?? [],
          sections: frontmatter.sections ?? [],
        };
      })
    );
  }

  loadMarkdown(url: string): Observable<MarkdownResult> {
    return this.http.get(url, { responseType: 'text' }).pipe(
      map((raw) => {
        const match = raw.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);

        if (!match) {
          return {
            content: raw.trim(),
            metadata: {},
          };
        }

        const frontmatter = parseYAML(match[1]);
        const content = match[2].trim();

        return {
          content,
          metadata: frontmatter,
        };
      })
    );
  }

  private parseMarkdown(content: string, file: string): BlogPost {
    const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);

    if (!match) {
      throw new Error(`Invalid markdown format in ${file}`);
    }

    const frontmatter = parseYAML(match[1]);
    const body = match[2];

    return {
      title: frontmatter.title,
      excerpt: frontmatter.excerpt,
      tags: frontmatter.tags || [],
      sections: frontmatter.sections || [],
      content: body.trim(),
      slug: file.split('/').pop()?.replace('.md', '') || '',
      image: frontmatter.image,
      author: frontmatter.author,
      date: frontmatter.date,
    };
  }
}
