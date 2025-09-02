import {
  Directive,
  ElementRef,
  Renderer2,
  AfterViewChecked,
  ComponentRef,
  ViewContainerRef,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { LogosComponent } from '../components/logos/logos.component';

@Directive({
  selector: '[appMarkdownDirective]'
})
export class MarkdownDirective implements AfterViewChecked {
  private hasReplaced = false;

  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private viewContainerRef = inject(ViewContainerRef);
  private cdr = inject(ChangeDetectorRef);

  ngAfterViewChecked() {
    if (this.hasReplaced) return;

    const htmlContent = this.el.nativeElement.innerHTML;

    // Regex voor [appLogos ...]
    const logosRegex = /\[appLogos\s*(\[[\s\S]*?\])?\]/;
    const match = htmlContent.match(logosRegex);

    if (match) {
      let imagesJson = match[1] || '[]';
      let imageUrls: string[] = [];

      try {
        // Cleanup stap: verwijder <a> tags en decodeer HTML entities
        imagesJson = imagesJson
          .replace(/<a[^>]*>/g, '') // verwijder <a ...>
          .replace(/<\/a>/g, '')    // verwijder </a>
          .replace(/&quot;/g, '"')  // decodeer &quot;
          .trim();

        imageUrls = JSON.parse(imagesJson);
      } catch (e) {
        console.error('❌ Failed to parse image URLs:', imagesJson, e);
      }

      // Split de content rond placeholder
      const parts = htmlContent.split(match[0]);
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');
      const tempElement = document.createElement('div');

      // Content voor
      if (parts[0]) {
        tempElement.innerHTML = parts[0];
        while (tempElement.firstChild) {
          this.renderer.appendChild(this.el.nativeElement, tempElement.firstChild);
        }
      }

      // Angular component renderen
      const componentRef: ComponentRef<LogosComponent> =
        this.viewContainerRef.createComponent(LogosComponent);

      if (imageUrls.length > 0) {
        componentRef.setInput('allLogos', imageUrls);
      }

      this.renderer.appendChild(
        this.el.nativeElement,
        componentRef.location.nativeElement
      );

      this.cdr.detectChanges();

      // Content na
      if (parts[1]) {
        tempElement.innerHTML = parts[1];
        while (tempElement.firstChild) {
          this.renderer.appendChild(this.el.nativeElement, tempElement.firstChild);
        }
      }

      this.hasReplaced = true;
    }
  }
}
