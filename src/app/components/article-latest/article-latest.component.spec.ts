import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleLatestComponent } from './article-latest.component';

describe('ArticleLatestComponent', () => {
  let component: ArticleLatestComponent;
  let fixture: ComponentFixture<ArticleLatestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleLatestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleLatestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
