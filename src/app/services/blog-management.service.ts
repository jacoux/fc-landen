import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, forkJoin, switchMap } from 'rxjs';
import { SaveToGithubService } from './saveToGithub';

export interface BlogFile {
  name: string;
  path: string;
  category: string;
}

export interface BlogCategory {
  name: string;
  displayName: string;
  files: BlogFile[];
}

export interface CategoryConfig {
  id: string;
  name: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogManagementService {
  private readonly http = inject(HttpClient);
  private readonly githubSave = inject(SaveToGithubService);


  getBlogCategories(): Observable<BlogCategory[]> {
    return this.loadCategoryConfigs().pipe(
      switchMap(configs => {
        const categoryRequests = configs.map(config =>
          this.getCategoryFiles(config.name).pipe(
            map(files => ({ name: config.name, displayName: config.displayName, files })),
            catchError(() => of({ name: config.name, displayName: config.displayName, files: [] }))
          )
        );
        return forkJoin(categoryRequests);
      })
    );
  }

  getCategoryConfigs(): Observable<CategoryConfig[]> {
    return this.loadCategoryConfigs();
  }

  private loadCategoryConfigs(): Observable<CategoryConfig[]> {
    return this.http.get<{categories: CategoryConfig[]}>('src/app/pages/categories.json').pipe(
      map(response => response.categories),
      catchError(() => {
        console.warn('Could not load categories.json, using defaults');
        return of([]);
      })
    );
  }

  private getCategoryFiles(category: string): Observable<BlogFile[]> {
    return this.autoDetectFiles(category);
  }

  private autoDetectFiles(category: string): Observable<BlogFile[]> {
    const testFiles = [
      'nieuw.md',
    ];

    const fileChecks = testFiles.map(fileName =>
      this.http.get(`assets/blog/${category}/${fileName}`, { responseType: 'text' }).pipe(
        map(() => ({
          name: fileName.replace('.md', ''),
          path: `assets/blog/${category}/${fileName}`,
          category
        })),
        catchError(() => of(null))
      )
    );

    return forkJoin(fileChecks).pipe(
      map(results => results.filter(file => file !== null) as BlogFile[])
    );
  }


  createNewFile(category: string, fileName: string): Observable<any> {
    const template = `---
        title: "Nieuwe artikel"
        author: "FC Landen"
        date: "${new Date().toISOString().split('T')[0]}"
        excerpt: "Artikel beschrijving"
        tags: []
        sections: []
        image: ""
        slug: "${fileName}"
        ---

        # Nieuwe artikel

        Inhoud van het artikel...
        `;

    const path = `assets/blog/${category}/${fileName}.md`;
    return this.githubSave.saveFile(path, template, null);
  }

  deleteFile(filePath: string): Observable<any> {
    return this.githubSave.deleteFile(filePath);
  }

  fileExists(category: string, fileName: string): Observable<boolean> {
    return this.http.get(`assets/blog/${category}/${fileName}.md`, { responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
