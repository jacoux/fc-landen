import {Component, OnInit, HostListener, input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logos',
  imports: [CommonModule],
  templateUrl: './logos.component.html',
  styleUrl: './logos.component.css'
})
export class LogosComponent implements OnInit {
  // Array of all logo URLs
  readonly allLogos = input<string[]>();
  readonly title = input<string>();

  logosPerPage = 8;
  currentPage = 0;
  totalPages = 0;
  currentLogos: string[] = [];

  ngOnInit() {
    if (this.allLogos()) {
      const logos = this.allLogos();
      if (logos && logos.length > 0) {
        this.totalPages = Math.ceil(logos.length / this.logosPerPage);
        this.currentPage = Math.floor(Math.random() * this.totalPages);
        this.updateCurrentLogos();
      }
    }
  }
  updateCurrentLogos() {
    const logos = this.allLogos();
    if (logos && logos.length > 0) {
      const startIndex = this.currentPage * this.logosPerPage;
      this.currentLogos = logos.slice(startIndex, startIndex + this.logosPerPage);
    } else {
      this.currentLogos = [];
    }
  }
  nextPage() {
    this.currentPage = (this.currentPage + 1) % this.totalPages;
    this.updateCurrentLogos();
  }

  // Navigate to the previous page
  prevPage() {
    this.currentPage = (this.currentPage - 1 + this.totalPages) % this.totalPages;
    this.updateCurrentLogos();
  }

  // Handle keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.prevPage();
    } else if (event.key === 'ArrowRight') {
      this.nextPage();
    }
  }
}
