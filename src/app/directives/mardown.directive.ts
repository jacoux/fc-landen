import { Directive, ElementRef, Renderer2, AfterViewInit, ComponentRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { BabynameHomeComponent } from '../components/babyname-home/babyname-home.component';

@Directive({
  selector: '[appMarkdownDirective]'
})
export class MarkdownDirective implements AfterViewInit {
  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngAfterViewInit() {
    const htmlContent = this.el.nativeElement.innerHTML;

    if (htmlContent.includes('[babyNameHome]')) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(BabynameHomeComponent);
      const componentRef: ComponentRef<BabynameHomeComponent> = this.viewContainerRef.createComponent(factory);

      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', htmlContent.replace('[babyNameHome]', ''));
      this.el.nativeElement.appendChild(componentRef.location.nativeElement);
    }
  }
}
