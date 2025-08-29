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
    let htmlContent = this.el.nativeElement.innerHTML;

    // For now, just handle basic content and let markdown render normally
    // The slider functionality can be added later when the basic markdown loading is working

    // Handle baby name home component (simple replacement)
    if (htmlContent.includes('[babyNameHome]')) {
      htmlContent = htmlContent.replace('[babyNameHome]', '<div>Baby Name Component Placeholder</div>');
    }

    // Handle slider components (convert to simple image list for now)
    const sliderMatches = htmlContent.match(/<slider[^>]*>[\s\S]*?<\/slider>/g);
    if (sliderMatches) {
      for (const sliderMatch of sliderMatches) {
        const sliderData = this.parseSliderMarkdown(sliderMatch);
        let imagesHtml = '<div class="slider-placeholder"><h4>Slider:</h4>';
        sliderData.images.forEach((img: any) => {
          imagesHtml += `<img src="${img.url}" alt="${img.caption || 'Image'}" style="max-width: 300px; margin: 10px;" />`;
        });
        imagesHtml += '</div>';
        htmlContent = htmlContent.replace(sliderMatch, imagesHtml);
      }
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
