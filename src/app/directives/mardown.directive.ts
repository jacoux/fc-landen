import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appMarkdownDirective]'
})
export class MarkdownDirective implements AfterViewInit {
  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    // Use setTimeout to process content after markdown has been rendered
    setTimeout(() => {
      this.processSliderContent();
    }, 500);
    
    // Set up mutation observer to handle dynamic content updates
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        this.processSliderContent();
      }, 100);
    });
    
    observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true
    });
  }

  private processSliderContent() {
    let htmlContent = this.el.nativeElement.innerHTML;
    let hasChanges = false;

    // Handle baby name home component (simple replacement)
    if (htmlContent.includes('[babyNameHome]')) {
      htmlContent = htmlContent.replace('[babyNameHome]', '<div>Baby Name Component Placeholder</div>');
      hasChanges = true;
    }

    // Handle slider components - convert to responsive image gallery
    const sliderMatches = htmlContent.match(/<slider[^>]*>[\s\S]*?<\/slider>/g);
    if (sliderMatches) {
      for (const sliderMatch of sliderMatches) {
        const sliderData = this.parseSliderMarkdown(sliderMatch);
        
        // Create a responsive image gallery as HTML
        let sliderHtml = `
        <div class="slider-container relative overflow-hidden rounded-lg shadow-lg bg-gray-100 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">`;
        
        sliderData.images.forEach((img: any) => {
          sliderHtml += `
            <div class="image-item">
              <img src="${img.url}" alt="${img.caption ?? 'Slider image'}" 
                   class="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                   onclick="this.classList.toggle('full-size')">
              ${img.caption ? `<p class="text-sm text-gray-600 mt-2 text-center">${img.caption}</p>` : ''}
            </div>`;
        });
        
        sliderHtml += `
          </div>
          ${sliderData.caption ? `<div class="px-4 pb-4"><p class="text-gray-700 text-sm text-center font-medium">${sliderData.caption}</p></div>` : ''}
        </div>
        <style>
          .image-item img.full-size {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            object-fit: contain;
            background: rgba(0,0,0,0.9);
            z-index: 9999;
            cursor: zoom-out;
          }
        </style>`;
        
        htmlContent = htmlContent.replace(sliderMatch, sliderHtml);
        hasChanges = true;
      }
    }

    // Only update innerHTML if we made changes
    if (hasChanges) {
      this.el.nativeElement.innerHTML = htmlContent;
    }
  }

  private parseSliderMarkdown(sliderMarkdown: string): any {
    const sliderData = {
      images: [] as any[],
      autoplay: false,
      interval: 3000,
      showDots: true,
      showArrows: true,
      caption: ''
    };

    // Parse attributes from opening tag
    const openTagMatch = sliderMarkdown.match(/<slider([^>]*)>/);
    if (openTagMatch) {
      const attributes = openTagMatch[1];

      // Parse boolean attributes
      sliderData.autoplay = attributes.includes('autoplay="true"');
      sliderData.showDots = !attributes.includes('showDots="false"');
      sliderData.showArrows = !attributes.includes('showArrows="false"');

      // Parse interval
      const intervalMatch = attributes.match(/interval="(\d+)"/);
      if (intervalMatch) {
        sliderData.interval = parseInt(intervalMatch[1]);
      }

      // Parse caption
      const captionMatch = attributes.match(/caption="([^"]*)"/);
      if (captionMatch) {
        sliderData.caption = captionMatch[1];
      }
    }

    // Parse images from content
    const imageMatches = sliderMarkdown.match(/- url: ([^\n]+)(?:\n\s+caption: ([^\n]+))?/g);
    if (imageMatches) {
      for (const imageMatch of imageMatches) {
        const urlMatch = imageMatch.match(/- url: (.+)/);
        const captionMatch = imageMatch.match(/caption: (.+)/);

        if (urlMatch) {
          sliderData.images.push({
            url: urlMatch[1].trim(),
            caption: captionMatch ? captionMatch[1].trim() : ''
          });
        }
      }
    }

    return sliderData;
  }
}
