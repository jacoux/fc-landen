import {Component, input} from '@angular/core';
export type BgColor = 'bg-purple-50' | 'bg-blue-50' | 'bg-green-50' | 'bg-yellow-50' | 'bg-red-50' | 'bg-gray-50' | 'bg-pink-50';
@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  readonly color = input<BgColor>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly link = input.required<string>();
  readonly linkTitle = input.required<string>();
}
