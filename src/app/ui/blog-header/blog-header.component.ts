import {Component, input, Input} from '@angular/core';

@Component({
  selector: 'app-blog-header',
  imports: [],
  templateUrl: './blog-header.component.html',
  styleUrl: './blog-header.component.scss'
})
export class BlogHeaderComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly author = input<string>();
  readonly readingTime = input<string>();
  readonly excerpt = input<string>();
  readonly date = input<string>();
}
