import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-card',
  imports: [CommonModule],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css'
})
export class ArticleCardComponent  {
  readonly image = input<string>();
  readonly title = input<string>();
  readonly excerpt = input<string>();
  readonly tags = input<string[]>();
  readonly author = input<string>();
  readonly sections = input<string[]>();
  readonly date = input<string>();
  readonly slug = input<string>();
}
