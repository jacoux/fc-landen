import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NameStore, Person } from '../../store/name.store';

@Component({
  selector: 'app-display-name',
  template: `
  <h3 class="text-2xl font-bold">Jouw kindjes:</h3>
  <ul class="list-disc pl-10">
    <li *ngFor="let person of people()">
      {{ person.name }} ({{ person.age }})
    </li>
  </ul>
`,
  styleUrl: './display-name.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class DisplayNameComponent {
    private nameStore = inject(NameStore);

    people = this.nameStore.people;


}
