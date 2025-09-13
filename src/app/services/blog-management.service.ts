import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, forkJoin, switchMap, tap } from 'rxjs';
import { SaveToGithubService } from './saveToGithub';
import { DeployNotificationService } from './deploy-notification.service';

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
  private readonly deployNotification = inject(DeployNotificationService);


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
    console.log('Loading category configs...');
    return this.http.get<{categories: CategoryConfig[]}>('src/app/pages/categories.json').pipe(
      map(response => {
        console.log('Categories loaded successfully:', response.categories);
        return response.categories;
      }),
      catchError((error) => {
        console.error('Could not load categories.json:', error);
        console.warn('Using default categories');
        const defaults = [
          { id: 'algemeen', name: 'algemeen', displayName: 'Algemeen' },
          { id: 'clubinfo', name: 'clubinfo', displayName: 'Club Info' },
          { id: 'ledeninfo', name: 'ledeninfo', displayName: 'Leden Info' },
          { id: 'jeugdvoetbal', name: 'jeugdvoetbal', displayName: 'Jeugdvoetbal' },
          { id: 'Drafts', name: 'Drafts', displayName: 'Drafts' }
        ];
        console.log('Using defaults:', defaults);
        return of(defaults);
      })
    );
  }

  private getCategoryFiles(category: string): Observable<BlogFile[]> {
    return this.autoDetectFiles(category);
  }

  private autoDetectFiles(category: string): Observable<BlogFile[]> {
    console.log('Auto-detecting files for category:', category);
    const testFiles = [
      // Algemeen files
      'fc-landen-kampioen-2a.md',
      'rust-zacht-voorzitter.md',
      'sponsordag-2025.md',
      'club-api.md',
      'events.md',
      'index.md',
      'j_privacy.md',
      'medewerker-worden.md',
      'sitemap.md',
      'sponsoren.md',
      'techniek.md',
      'wedstrijdinfo.md',
      'word-medewerker.md',

      // Clubinfo files
      'clubgegevens.md',
      'contact.md',
      'infrastructuur.md',
      'intern-reglement.md',
      'organogram.md',
      'privacy.md',
      'route.md',
      'visie.md',

      // Ledeninfo files
      'ledeninfo.md',
      'attesten-mutualiteit.md',
      'ehbso.md',
      'gezinskorting.md',
      'huisregels.md',
      'lifestyle.md',
      'prosoccerdata.md',
      'sportvoeding.md',
      'voor-de-jeugdafgevaardigde.md',
      'voor-de-jeugdouder.md',
      'voor-de-jeugdspeler.md',
      'voor-de-jeugdtrainer.md',

      // Jeugdvoetbal files
      'jeugdvoetbal.md',
      'lid-worden.md',
      'visie-jeugd.md',
      'doorstroming.md',
      'ethiek-en-fairplay.md',
      'organogram-jeugd.md',
      'come-together.md',
      'ploegvoorstelling-jeugd-2024-2025.md',
      'samenwerking-voetjebal.md',

      // Other
      'ongevallen.md',
      'nieuw.md'
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
      map(results => {
        const validFiles = results.filter(file => file !== null) as BlogFile[];
        console.log(`Found ${validFiles.length} files in category ${category}:`, validFiles.map(f => f.name));
        return validFiles;
      })
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
    return this.githubSave.saveFile(path, template, null).pipe(
      tap(() => this.deployNotification.startDeployCountdown())
    );
  }

  deleteFile(filePath: string): Observable<any> {
    return this.githubSave.deleteFile(filePath).pipe(
      tap(() => this.deployNotification.startDeployCountdown())
    );
  }
}
