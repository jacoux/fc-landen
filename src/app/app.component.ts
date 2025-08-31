import {Component, OnInit, AfterViewInit, inject, PLATFORM_ID, signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import { BabynameHomeComponent } from "./components/babyname-home/babyname-home.component";
import { DisplayNameComponent } from "./components/display-name/display-name.component";
import {isPlatformBrowser, CommonModule} from '@angular/common';
import {MenuService, MenuItem} from './services/menu.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'FC Landen';
  private readonly platformId = inject(PLATFORM_ID);
  menuItems = signal<MenuItem[]>([]);

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.menuConfig$.subscribe(config => {
      this.menuItems.set(config.menuItems);
    });
  }

  ngAfterViewInit(): void {
    this.initializeMobileMenu();
    this.initializeMobileDropdowns();
  }

  private initializeMobileMenu(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!mobileMenuBtn.contains(target) && !mobileMenu.contains(target)) {
          mobileMenu.classList.add('hidden');
        }
      });
    }

  }

  private initializeMobileDropdowns(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const dropdowns = document.querySelectorAll('.mobile-dropdown');

    dropdowns.forEach((dropdown) => {
      const btn = dropdown.querySelector('.mobile-dropdown-btn') as HTMLElement;
      const content = dropdown.querySelector('.mobile-dropdown-content') as HTMLElement;
      const icon = btn?.querySelector('svg') as SVGElement;

      if (btn && content && icon) {
        btn.addEventListener('click', (event) => {
          event.preventDefault();

          // Close all other dropdowns
          dropdowns.forEach((otherDropdown) => {
            if (otherDropdown !== dropdown) {
              const otherContent = otherDropdown.querySelector('.mobile-dropdown-content') as HTMLElement;
              const otherIcon = otherDropdown.querySelector('.mobile-dropdown-btn svg') as SVGElement;
              if (otherContent && otherIcon) {
                otherContent.classList.add('hidden');
                otherIcon.classList.remove('rotate-180');
              }
            }
          });

          // Toggle current dropdown
          content.classList.toggle('hidden');
          icon.classList.toggle('rotate-180');
        });
      }
    });
  }
}
