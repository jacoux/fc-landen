import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';

interface SliderImage {
  url: string;
  caption?: string;
}

@Component({
  selector: 'app-slider',
  standalone: true,
  template: `
    <div class="slider-container relative overflow-hidden rounded-lg shadow-lg bg-gray-100">
      <div class="slider-wrapper relative h-64 sm:h-80 md:h-96">
        <!-- Images -->
        @for (image of images; track image.url; let i = $index) {
          <div
            class="slider-slide absolute inset-0 transition-opacity duration-500 ease-in-out"
            [class.opacity-100]="currentSlide() === i"
            [class.opacity-0]="currentSlide() !== i"
          >
            <img
              [src]="image.url"
              [alt]="image.caption || 'Slider image'"
              class="w-full h-full object-cover"
            >
            @if (image.caption) {
              <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                <p class="text-sm">{{ image.caption }}</p>
              </div>
            }
          </div>
        }
        <!-- Loading state -->
        @if (images.length === 0) {
          <div class="flex items-center justify-center h-full">
            <div class="text-gray-500">Afbeeldingen worden geladen...</div>
          </div>
        }

        <!-- Navigation Arrows -->
        @if (showArrows && images.length > 1) {
          <button
            (click)="previousSlide()"
            class="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all z-10"
            aria-label="Vorige afbeelding"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>

          <button
            (click)="nextSlide()"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all z-10"
            aria-label="Volgende afbeelding"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        }
      </div>

      <!-- Dots Navigation -->
      @if (showDots && images.length > 1) {
        <div class="flex justify-center space-x-2 py-4">
          @for (image of images; track image.url; let i = $index) {
            <button
              (click)="goToSlide(i)"
              class="w-3 h-3 rounded-full transition-all duration-200"
              [class.bg-blue-500]="currentSlide() === i"
              [class.bg-gray-300]="currentSlide() !== i"
              [attr.aria-label]="'Ga naar afbeelding ' + (i + 1)"
            ></button>
          }
        </div>
      }

      <!-- Caption -->
      @if (caption) {
        <div class="px-4 pb-4">
          <p class="text-gray-700 text-sm text-center">{{ caption }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .slider-container {
      max-width: 100%;
    }

    .slider-slide {
      will-change: opacity;
    }

    @media (max-width: 640px) {
      .slider-wrapper {
        height: 16rem; /* h-64 */
      }
    }
  `]
})
export class SliderComponent implements OnInit, OnDestroy {
  @Input() images: SliderImage[] = [];
  @Input() autoplay: boolean = false;
  @Input() interval: number = 3000;
  @Input() showDots: boolean = true;
  @Input() showArrows: boolean = true;
  @Input() caption: string = '';

  currentSlide = signal(0);
  private autoplayInterval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    if (this.autoplay && this.images.length > 1) {
      this.startAutoplay();
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  nextSlide() {
    if (this.images.length === 0) return;
    this.currentSlide.set((this.currentSlide() + 1) % this.images.length);
  }

  previousSlide() {
    if (this.images.length === 0) return;
    this.currentSlide.set(this.currentSlide() === 0 ? this.images.length - 1 : this.currentSlide() - 1);
  }

  goToSlide(index: number) {
    if (index >= 0 && index < this.images.length) {
      this.currentSlide.set(index);
    }
  }

  private startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.interval);
  }

  private stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = undefined;
    }
  }

  // Pause autoplay on hover
  onMouseEnter() {
    if (this.autoplay) {
      this.stopAutoplay();
    }
  }

  // Resume autoplay on mouse leave
  onMouseLeave() {
    if (this.autoplay && this.images.length > 1) {
      this.startAutoplay();
    }
  }
}
