import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface MenuItem {
  id: string;
  label: string;
  route: string;
  subitems: MenuItem[];
}

export interface MenuConfig {
  menuItems: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuConfigSubject = new BehaviorSubject<MenuConfig>({ menuItems: [] });
  public menuConfig$ = this.menuConfigSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialConfig();
  }

  private loadInitialConfig() {
    this.getMenuConfig().subscribe(config => {
      this.menuConfigSubject.next(config);
    });
  }

  getMenuConfig(): Observable<MenuConfig> {
    return this.http.get<MenuConfig>('assets/menu-config.json');
  }

  saveMenuConfig(config: MenuConfig): Observable<any> {
    // Update the behavior subject immediately for UI responsiveness
    this.menuConfigSubject.next(config);
    
    // Save to backend API
    return this.http.post('/api/save-menu-config', config);
  }

  getCurrentMenuConfig(): MenuConfig {
    return this.menuConfigSubject.value;
  }
}