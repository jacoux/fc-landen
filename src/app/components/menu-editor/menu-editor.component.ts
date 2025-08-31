import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MenuService } from '../../services/menu.service';
import { BlogService } from '../../services/blog.service';

export interface MenuItem {
  id: string;
  label: string;
  route: string;
  subitems: MenuItem[];
}

export interface MenuConfig {
  menuItems: MenuItem[];
}

@Component({
  selector: 'app-menu-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="menu-editor p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Menu Editor</h2>

      <!-- Available Files -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-700">Available Files</h3>
        <div
          class="available-files min-h-[100px] p-4 border-2 border-dashed border-gray-300 rounded-lg"
          cdkDropList
          #availableList="cdkDropList"
          [cdkDropListData]="availableFiles()"
          [cdkDropListConnectedTo]="['menuList']"
          (cdkDropListDropped)="drop($event)">
          <div
            *ngFor="let file of availableFiles()"
            class="file-item p-2 mb-2 bg-blue-100 border border-blue-200 rounded cursor-move hover:bg-blue-200"
            cdkDrag>
            <div class="flex justify-between items-center">
              <span class="font-medium">{{file.label}}</span>
              <span class="text-sm text-gray-600">{{file.route}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Structure -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-700">Menu Structure</h3>
        <div
          class="menu-structure min-h-[200px] p-4 border-2 border-dashed border-green-300 rounded-lg"
          cdkDropList
          #menuList="cdkDropList"
          [cdkDropListData]="menuItems()"
          [cdkDropListConnectedTo]="['availableList']"
          (cdkDropListDropped)="drop($event)">

          <div *ngFor="let item of menuItems(); let i = index" class="menu-item mb-4">
            <!-- Main Menu Item -->
            <div class="main-item p-3 bg-green-100 border border-green-200 rounded-lg">
              <div class="flex justify-between items-center" cdkDrag [cdkDragData]="item">
                <div class="flex-1">
                  <input
                    type="text"
                    [(ngModel)]="item.label"
                    class="font-semibold bg-transparent border-none outline-none w-full"
                    placeholder="Menu label">
                  <div class="text-sm text-gray-600 mt-1">{{item.route}}</div>
                </div>
                <div class="flex gap-2">
                  <button
                    (click)="addSubitem(i)"
                    class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                    Add Sub
                  </button>
                  <button
                    (click)="removeMenuItem(i)"
                    class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
                    Remove
                  </button>
                </div>
              </div>

              <!-- Subitems -->
              <div
                *ngIf="item.subitems.length > 0"
                class="subitems mt-3 ml-4 p-3 bg-green-50 rounded-lg border border-green-200"
                cdkDropList
                [id]="'sublist-' + i"
                [cdkDropListData]="item.subitems"
                [cdkDropListConnectedTo]="['availableList']"
                (cdkDropListDropped)="dropSubitem($event, i)">

                <div
                  *ngFor="let subitem of item.subitems; let j = index"
                  class="subitem p-2 mb-2 bg-white border border-gray-200 rounded flex justify-between items-center"
                  cdkDrag>
                  <div class="flex-1">
                    <input
                      type="text"
                      [(ngModel)]="subitem.label"
                      class="font-medium bg-transparent border-none outline-none w-full"
                      placeholder="Subitem label">
                    <div class="text-sm text-gray-500">{{subitem.route}}</div>
                  </div>
                  <button
                    (click)="removeSubitem(i, j)"
                    class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          (click)="saveMenu()"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">
          Save Menu
        </button>
        <button
          (click)="loadMenu()"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
          Reload Menu
        </button>
        <button
          (click)="addMainItem()"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg  font-semibold">
          Add Main Item
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class MenuEditorComponent implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  availableFiles = signal<MenuItem[]>([]);

  constructor(
    private menuService: MenuService,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    this.loadMenu();
    this.loadAvailableFiles();
  }

  loadMenu() {
    this.menuService.getMenuConfig().subscribe(config => {
      this.menuItems.set(config.menuItems);
    });
  }

  loadAvailableFiles() {
    // Get all available blog files and convert them to menu items
    const files = [
      { id: 'home', label: 'Home', route: '/', subitems: [] },
      { id: 'clubgegevens', label: 'Clubgegevens', route: '/blog/clubinfo/clubgegevens', subitems: [] },
      { id: 'visie', label: 'Visie', route: '/blog/clubinfo/visie', subitems: [] },
      { id: 'organogram', label: 'Organogram', route: '/blog/clubinfo/organogram', subitems: [] },
      { id: 'infrastructuur', label: 'Infrastructuur', route: '/blog/clubinfo/infrastructuur', subitems: [] },
      { id: 'route', label: 'Route', route: '/blog/clubinfo/route', subitems: [] },
      { id: 'contact', label: 'Contact', route: '/blog/clubinfo/contact', subitems: [] },
      { id: 'intern-reglement', label: 'Intern reglement', route: '/blog/clubinfo/intern-reglement', subitems: [] },
      { id: 'privacy', label: 'Privacy', route: '/blog/clubinfo/privacy', subitems: [] },
      { id: 'jeugdvoetbal', label: 'Jeugdvoetbal', route: '/blog/jeugdvoetbal/jeugdvoetbal', subitems: [] },
      { id: 'lid-worden', label: 'Lid worden', route: '/blog/jeugdvoetbal/lid-worden', subitems: [] },
      { id: 'visie-jeugd', label: 'Visie jeugd', route: '/blog/jeugdvoetbal/visie-jeugd', subitems: [] },
      { id: 'doorstroming', label: 'Doorstroming', route: '/blog/jeugdvoetbal/doorstroming', subitems: [] },
      { id: 'ethiek-en-fairplay', label: 'Ethiek en fairplay', route: '/blog/jeugdvoetbal/ethiek-en-fairplay', subitems: [] },
      { id: 'organogram-jeugd', label: 'Organogram jeugd', route: '/blog/jeugdvoetbal/organogram-jeugd', subitems: [] },
      { id: 'come-together', label: 'Come together', route: '/blog/jeugdvoetbal/come-together', subitems: [] },
      { id: 'ledeninfo', label: 'Ledeninfo', route: '/blog/ledeninfo/ledeninfo', subitems: [] },
      { id: 'prosoccerdata', label: 'ProSoccerData', route: '/blog/ledeninfo/prosoccerdata', subitems: [] },
      { id: 'huisregels', label: 'Huisregels', route: '/blog/ledeninfo/huisregels', subitems: [] },
      { id: 'attesten-mutualiteit', label: 'Attesten mutualiteit', route: '/blog/ledeninfo/attesten-mutualiteit', subitems: [] },
      { id: 'gezinskorting', label: 'Gezinskorting', route: '/blog/ledeninfo/gezinskorting', subitems: [] },
      { id: 'ehbso', label: 'EHBSO', route: '/blog/ledeninfo/ehbso', subitems: [] },
      { id: 'lifestyle', label: 'Lifestyle', route: '/blog/ledeninfo/lifestyle', subitems: [] },
      { id: 'sportvoeding', label: 'Sportvoeding', route: '/blog/ledeninfo/sportvoeding', subitems: [] },
      { id: 'wedstrijdinfo', label: 'Wedstrijdinfo', route: '/blog/algemeen/wedstrijdinfo', subitems: [] },
      { id: 'techniek', label: 'Techniek', route: '/blog/algemeen/techniek', subitems: [] },
      { id: 'sponsoren', label: 'Sponsoren', route: '/blog/algemeen/sponsoren', subitems: [] },
      { id: 'club-api', label: 'Club API', route: '/blog/algemeen/club-api', subitems: [] },
      { id: 'medewerker-worden', label: 'Medewerker worden', route: '/blog/algemeen/medewerker-worden', subitems: [] },
      { id: 'ongevallen', label: 'Ongevallen', route: '/blog/ongevallen', subitems: [] }
    ];

    // Filter out items that are already in the menu
    const currentMenuIds = new Set();
    this.menuItems().forEach(item => {
      currentMenuIds.add(item.id);
      item.subitems.forEach(sub => currentMenuIds.add(sub.id));
    });

    const availableFiles = files.filter(file => !currentMenuIds.has(file.id));
    this.availableFiles.set(availableFiles);
  }

  drop(event: CdkDragDrop<MenuItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.updateAvailableFiles();
  }

  dropSubitem(event: CdkDragDrop<MenuItem[]>, mainIndex: number) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.updateAvailableFiles();
  }

  addMainItem() {
    const newItem: MenuItem = {
      id: 'new-' + Date.now(),
      label: 'New Menu Item',
      route: '/new-route',
      subitems: []
    };
    this.menuItems.update(items => [...items, newItem]);
  }

  addSubitem(mainIndex: number) {
    const newSubitem: MenuItem = {
      id: 'new-sub-' + Date.now(),
      label: 'New Subitem',
      route: '/new-sub-route',
      subitems: []
    };
    this.menuItems.update(items => {
      const newItems = [...items];
      newItems[mainIndex].subitems.push(newSubitem);
      return newItems;
    });
  }

  removeMenuItem(index: number) {
    const removedItem = this.menuItems()[index];

    // Add main item and all subitems back to available files
    this.availableFiles.update(files => {
      const newFiles = [...files];
      newFiles.push({ ...removedItem, subitems: [] });
      removedItem.subitems.forEach(sub => {
        newFiles.push({ ...sub, subitems: [] });
      });
      return newFiles;
    });

    // Remove from menu
    this.menuItems.update(items => items.filter((_, i) => i !== index));
  }

  removeSubitem(mainIndex: number, subIndex: number) {
    const removedSubitem = this.menuItems()[mainIndex].subitems[subIndex];

    // Add back to available files
    this.availableFiles.update(files => [...files, { ...removedSubitem, subitems: [] }]);

    // Remove from menu
    this.menuItems.update(items => {
      const newItems = [...items];
      newItems[mainIndex].subitems = newItems[mainIndex].subitems.filter((_, i) => i !== subIndex);
      return newItems;
    });
  }

  updateAvailableFiles() {
    this.loadAvailableFiles();
  }

  saveMenu() {
    const config: MenuConfig = {
      menuItems: this.menuItems()
    };

    this.menuService.saveMenuConfig(config).subscribe({
      next: () => {
        console.log('Menu saved successfully');
        alert('Menu saved successfully!');
      },
      error: (err) => {
        console.error('Error saving menu:', err);
        alert('Error saving menu!');
      }
    });
  }
}
