import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NameStoreService {
  // Signal voor de naam
  public name = signal<string>('');

  // Methode om de naam te updaten
  setName(newName: string) {
    this.name.set(newName);
  }
}
