import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarEditorComponent } from './sidebar-editor.component';

describe('SidebarEditorComponent', () => {
  let component: SidebarEditorComponent;
  let fixture: ComponentFixture<SidebarEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
