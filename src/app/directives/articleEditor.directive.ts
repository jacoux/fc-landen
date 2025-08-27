import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
  Signal,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Directive({
  selector: '[articleEditor]',
  standalone: true,
})
export class EditorModeDirective {
  private route = inject(ActivatedRoute);
  private view = inject(ViewContainerRef);
  private template = inject(TemplateRef<any>);

  editorMode = signal(false);

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const isEditor = params.get('editor') === 'true';
      this.editorMode.set(isEditor);

      if (isEditor) {
        // Optioneel: initEditorLogic() triggeren hier
      }

      this.updateView();
    });
  }

  private updateView() {
    this.view.clear();
    if (this.editorMode()) {
      this.view.createEmbeddedView(this.template);
    }
  }
}
