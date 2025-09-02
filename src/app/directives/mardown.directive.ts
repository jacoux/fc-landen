import {
  Directive,
  ElementRef,
  Renderer2,
  AfterViewInit,
  ComponentRef,
  ComponentFactoryResolver,
  ViewContainerRef, AfterContentInit, AfterViewChecked, inject
} from '@angular/core';
import {LogosComponent} from '../components/logos/logos.component';

@Directive({
  selector: '[appMarkdownDirective]'
})
export class MarkdownDirective implements AfterViewChecked {
  private hasReplaced = false;

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
    private readonly viewContainerRef: ViewContainerRef
  ) {}

  ngAfterViewChecked() {
    if (this.hasReplaced) return;

    const htmlContent: string = this.el.nativeElement.innerHTML;

    // Check for [appLogos] with or without image data
    const logosRegex = /\[appLogos(\s+(\[.*?\]))?\]/;
    const match = htmlContent.match(logosRegex);

    if (match) {
      // Extract the JSON string of image URLs if present
      const imagesJson = match[2] || '[]';
      let imageUrls: string[] = [];

      try {
        // Parse the JSON string to get the array of image URLs
        imageUrls = JSON.parse(imagesJson);
      } catch (e) {
        console.error('Failed to parse image URLs:', e);
      }

      // Split content on the placeholder (including any image data)
      const parts = htmlContent.split(match[0]);

      // Maak container leeg
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');

      // Create a temporary container to parse HTML
      const tempElement = document.createElement('div');

      // Voeg content voor placeholder toe
      if (parts[0]) {
        tempElement.innerHTML = parts[0];
        // Append each child node to avoid extra wrapper divs
        while (tempElement.firstChild) {
          this.renderer.appendChild(this.el.nativeElement, tempElement.firstChild);
        }
      }

      // Voeg component op die plaats in
      const componentRef: ComponentRef<LogosComponent> =
        this.viewContainerRef.createComponent(LogosComponent);

      // Set the allLogos input if we have image URLs
      if (imageUrls.length > 0) {
        componentRef.setInput('allLogos', imageUrls);
      }

      this.renderer.appendChild(
        this.el.nativeElement,
        componentRef.location.nativeElement
      );

      // Voeg content na placeholder toe
      if (parts[1]) {
        tempElement.innerHTML = parts[1];
        // Append each child node to avoid extra wrapper divs
        while (tempElement.firstChild) {
          this.renderer.appendChild(this.el.nativeElement, tempElement.firstChild);
        }
      }

      this.hasReplaced = true;
    }
  }
}
