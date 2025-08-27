import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  inject,
  PLATFORM_ID,
  signal,
  effect,
  OnDestroy,
  computed,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Directive({
  selector: '[appEditor]',
  standalone: true,
})
export class EditorDirective implements OnDestroy {
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly editorQueryParam = signal<string | null>(null);
  private readonly editorMode = computed(() => this.editorQueryParam() === 'true');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.editorQueryParam.set(this.route.snapshot.queryParamMap.get('editor'));
      this.route.queryParamMap
        .pipe(
          map(params => params.get('editor')),
          takeUntilDestroyed()
        )
        .subscribe(editorParam => {
          this.editorQueryParam.set(editorParam);
        });
      effect(() => {
        this.updateView();
      });
    }
  }

  private updateView(): void {
    const hasView = this.viewContainer.length > 0;
    const shouldShow = this.editorMode();

    if (shouldShow && !hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (!shouldShow && hasView) {
      this.viewContainer.clear();
    }
  }

  ngOnDestroy(): void {
    // Cleanup is handled automatically by takeUntilDestroyed()
  }
}
