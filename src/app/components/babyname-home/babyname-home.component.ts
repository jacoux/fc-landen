import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NameStore, Person } from '../../store/name.store';

@Component({
  selector: 'app-babyname-home',
  imports: [FormsModule, CommonModule],
  templateUrl: './babyname-home.html',
  styleUrl: './babyname-home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class BabynameHomeComponent {
  private nameStore = inject(NameStore);

  newName = signal('');
  newAge = signal<number | null>(null);
  people = this.nameStore.people;

  addPerson() {
    const name = this.newName();
    const age = this.newAge();

    if (name && age !== null) {
      this.nameStore.addPerson({ name, age });
      this.newName.set('');
      this.newAge.set(null);
    }
  }

  updateName(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.nameStore.updatePerson(index, { name: input.value });
  }

  updateAge(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const age = parseInt(input.value, 10);
    if (!isNaN(age)) {
      this.nameStore.updatePerson(index, { age });
    }
  }

  removePerson(index: number) {
    this.nameStore.removePerson(index);
  }
}