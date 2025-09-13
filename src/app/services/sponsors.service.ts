import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { SaveToGithubService } from './saveToGithub';
import { DeployNotificationService } from './deploy-notification.service';

export interface SponsorsData {
  title: string;
  logos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SponsorsService {
  private readonly http = inject(HttpClient);
  private readonly githubSave = inject(SaveToGithubService);
  private readonly deployNotification = inject(DeployNotificationService);
  private readonly sponsorsFile = 'assets/sponsors.json';

  /**
   * Get the sponsors data from the JSON file
   */
  getSponsors(): Observable<SponsorsData> {
    return this.http.get<SponsorsData>(this.sponsorsFile).pipe(
      catchError(error => {
        console.error('Error loading sponsors data:', error);
        // Return default data if file not found or other error
        return of({
          title: 'Met dank aan onze sponsors',
          logos: []
        });
      })
    );
  }

  /**
   * Save the sponsors data to the JSON file
   */
  saveSponsors(data: SponsorsData): Observable<any> {
    const content = JSON.stringify(data, null, 2); // pretty json
    return this.githubSave.saveFile(this.sponsorsFile, content, null).pipe(
      tap(() => {
        console.log('✅ Sponsors data saved');
        this.deployNotification.startDeployCountdown();
      }),
      map(() => true),
      catchError(error => {
        console.error('❌ Failed to save sponsors data', error);
        throw error;
      })
    );
  }

  /**
   * Add a new logo URL to the sponsors data
   */
  addLogo(logoUrl: string): Observable<boolean> {
    return this.getSponsors().pipe(
      map(data => {
        // Add the new logo if it doesn't already exist
        if (!data.logos.includes(logoUrl)) {
          data.logos.push(logoUrl);
          return data;
        }
        return data;
      }),
      switchMap(data => this.saveSponsors(data))
    );
  }

  /**
   * Remove a logo URL from the sponsors data
   */
  removeLogo(logoUrl: string): Observable<boolean> {
    return this.getSponsors().pipe(
      map(data => {
        data.logos = data.logos.filter(url => url !== logoUrl);
        return data;
      }),
      switchMap(data => this.saveSponsors(data))
    );
  }

  /**
   * Upload a logo image file
   */
  uploadLogo(file: File): Observable<string> {
    return this.githubSave.uploadImage(file).pipe(
      map(response => {
        if (response.success && response.file && response.file.url) {
          return response.file.url;
        }
        throw new Error('Failed to upload image');
      }),
      catchError(error => {
        console.error('❌ Failed to upload logo', error);
        throw error;
      })
    );
  }
}
