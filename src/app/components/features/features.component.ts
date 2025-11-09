import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureItem } from '../../types/HomePageData.types';

@Component({
  selector: 'app-features',
  imports: [CommonModule],
  templateUrl: './features.component.html',
})
export class FeaturesComponent {
  readonly title = input<string>('Onze waarden en normen');
  readonly description = input<string>('FC landen draagt waarden en normen hoog in het vaandel.');
  readonly featureItems = input<FeatureItem[]>([]);
}
