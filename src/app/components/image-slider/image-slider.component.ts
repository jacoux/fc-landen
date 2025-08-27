import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SlideImage {
  src: string;
  alt: string;
  caption?: string;
}

@Component({
  selector: 'app-image-slider',
  standalone: true,
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.css']
})
export class ImageSliderComponent implements OnInit {
  @Input() images: SlideImage[] = [];
  @Input() autoPlay: boolean = true;
  @Input() interval: number = 5000;
  @Input() showDots: boolean = true;
  @Input() showArrows: boolean = true;
  @Input() height: string = 'h-96';

  currentIndex = 0;
  private autoPlayInterval?: any;
  @Input() description!: string;

  ngOnInit() {
    if (this.autoPlay && this.images.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.interval);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevSlide() {
    this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  onMouseEnter() {
    if (this.autoPlay) {
      this.stopAutoPlay();
    }
  }

  onMouseLeave() {
    if (this.autoPlay && this.images.length > 1) {
      this.startAutoPlay();
    }
  }
}
