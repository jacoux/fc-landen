import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface Person {
  name: string;
  age: number;
}

interface NameState {
  people: Person[];
}

export const NameStore = signalStore(
  { providedIn: 'root' },
  withState<NameState>({ people: [] }),
  withMethods((store) => ({
    addPerson(person: Person){
          patchState(store, state => ({ people: [...state.people, person] }));
    },
    
    updatePerson: (index: number, updatedPerson: Partial<Person>) => {
      patchState(store, state => {
        const updatedPeople = [...state.people];
        updatedPeople[index] = { ...updatedPeople[index], ...updatedPerson };
        return { people: updatedPeople };
      });
    },

      removePerson: (index: number) => {
        patchState(store,state => ({people: state.people.filter((_: any, i: number) => i !== index)}))
    },
  }))
);