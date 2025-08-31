import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logos',
  imports: [CommonModule],
  templateUrl: './logos.component.html',
  styleUrl: './logos.component.css'
})
export class LogosComponent implements OnInit {
  // Array of all logo URLs
  allLogos: string[] = [
    'https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b03aedf8d5a0_Microsoft%20Logo.svg',
    'https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0620ef8d5a5_PayPal%20Logo.svg',
    'https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b00612f8d5a4_Google%20Logo.svg',
    'https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0582cf8d599_Chase%20Logo.svg',
    'https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0484ef8d59a_Walmart%20Logo.svg',
    'https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2Fslack.svg?alt=media&token=c951092f-1daa-4a42-bbd4-7cd460c1a2a5',
    // Add more logos here as needed to have more than 8 total
    'https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b03aedf8d5a0_Microsoft%20Logo.svg',
    'https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0620ef8d5a5_PayPal%20Logo.svg',
    'https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b00612f8d5a4_Google%20Logo.svg',
    'https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0582cf8d599_Chase%20Logo.svg'
  ];

  // Number of logos to display per page
  logosPerPage = 8;

  // Current page index
  currentPage = 0;

  // Total number of pages
  totalPages = 0;

  // Current logos to display
  currentLogos: string[] = [];

  ngOnInit() {
    this.totalPages = Math.ceil(this.allLogos.length / this.logosPerPage);

    // Start at a random page
    this.currentPage = Math.floor(Math.random() * this.totalPages);

    this.updateCurrentLogos();
  }

  // Update the current logos based on the current page
  updateCurrentLogos() {
    const startIndex = this.currentPage * this.logosPerPage;
    this.currentLogos = this.allLogos.slice(startIndex, startIndex + this.logosPerPage);
  }

  // Navigate to the next page
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
