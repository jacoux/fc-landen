import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SaveToGithubService {
  constructor(private readonly http: HttpClient) {}

  saveFile(filePath: string, content: string, sha: string | null = null) {
    return this.http.post('https://fc-landen.vercel.app/api/save-to-github', {
      filePath,
      content
    });
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{success: number, file: {url: string, name: string, size: number}}>('https://fc-landen.vercel.app/api/upload-image', formData);
  }

  deleteFile(filePath: string) {
    return this.http.delete('https://fc-landen.vercel.app/api/save-to-github', {
      body: { filePath }
    });
  }
}
