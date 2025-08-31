import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { BlogManagementService, BlogCategory, CategoryConfig } from '../../services/blog-management.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuEditorComponent } from '../../components/menu-editor/menu-editor.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, MenuEditorComponent, CommonModule],
  template: `
    <div class="dashboard-header">
      <h2>Dashboard</h2>
      <p>Welcome, {{ authService.currentUser()?.email }}!</p>
      <button (click)="onLogout()" class="logout-btn">Logout</button>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        (click)="activeTab.set('blog')" 
        [class.active]="activeTab() === 'blog'"
        class="tab-btn">
        Blog Management
      </button>
      <button 
        (click)="activeTab.set('menu')" 
        [class.active]="activeTab() === 'menu'"
        class="tab-btn">
        Menu Editor
      </button>
    </div>

    <!-- Blog Management Tab -->
    @if (activeTab() === 'blog') {
      <div class="blog-management">
      <h3>Blog Management</h3>

      <div class="create-file-section">
        <h4>Voeg een nieuw artikel toe</h4>
        <select [(ngModel)]="selectedCategory" class="category-select">
          <option value="">Select Category</option>
          @for (config of categoryConfigs(); track config.id) {
            <option [value]="config.name">{{ config.displayName }}</option>
          }
        </select>
        <input [(ngModel)]="newFileName" placeholder="File name" class="file-input" />
        <button (click)="createNewFile()" [disabled]="!selectedCategory || !newFileName" class="create-btn">
          Create Article
        </button>
      </div>

      <div class="categories-list">
        @for (category of categories(); track category.name) {
          <div class="category-section">
            <h4>{{ category.displayName }}</h4>
            @if (category.files.length === 0) {
              <p class="no-files">No files in this category</p>
            } @else {
              <div class="files-list">
                @for (file of category.files; track file.path) {
                  <div class="file-item">
                    <span class="file-name">{{ file.name }}</span>
                    <div class="file-actions">
                      <button (click)="editFile(file.path)" class="edit-btn">Edit</button>
                      <button (click)="deleteFile(file.path, file.name)" class="delete-btn">Delete</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
      </div>
    }

    <!-- Menu Editor Tab -->
    @if (activeTab() === 'menu') {
      <app-menu-editor></app-menu-editor>
    }
  `,
  styles: [`
    :host {
      display: block;
      max-width: 1000px;
      margin: 20px auto;
      padding: 20px;
    }
    .dashboard-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .logout-btn {
      padding: 8px 16px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
    .logout-btn:hover {
      background-color: #c82333;
    }
    .tab-navigation {
      display: flex;
      gap: 0;
      margin-bottom: 20px;
      border-bottom: 1px solid #dee2e6;
    }
    .tab-btn {
      padding: 12px 24px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #6c757d;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      color: #495057;
      background-color: #f8f9fa;
    }
    .tab-btn.active {
      color: #007bff;
      border-bottom-color: #007bff;
      background-color: #fff;
    }
    .blog-management {
      text-align: left;
    }
    .create-file-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .create-file-section h4 {
      margin-top: 0;
    }
    .category-select, .file-input {
      padding: 8px 12px;
      margin-right: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .create-btn {
      padding: 8px 16px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .create-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    .create-btn:hover:not(:disabled) {
      background-color: #218838;
    }
    .category-section {
      margin-bottom: 25px;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 15px;
    }
    .category-section h4 {
      margin-top: 0;
      color: #495057;
      text-transform: capitalize;
    }
    .no-files {
      color: #6c757d;
      font-style: italic;
    }
    .files-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 4px;
    }
    .file-name {
      font-weight: 500;
    }
    .file-actions {
      display: flex;
      gap: 8px;
    }
    .edit-btn {
      padding: 6px 12px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .edit-btn:hover {
      background-color: #0056b3;
    }
    .delete-btn {
      padding: 6px 12px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .delete-btn:hover {
      background-color: #c82333;
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  blogManagement = inject(BlogManagementService);
  router = inject(Router);

  categories = signal<BlogCategory[]>([]);
  categoryConfigs = signal<CategoryConfig[]>([]);
  selectedCategory = '';
  newFileName = '';
  activeTab = signal<'blog' | 'menu'>('blog');

  ngOnInit() {
    this.loadBlogCategories();
    this.loadCategoryConfigs();
  }

  loadBlogCategories() {
    this.blogManagement.getBlogCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadCategoryConfigs() {
    this.blogManagement.getCategoryConfigs().subscribe({
      next: (configs) => {
        this.categoryConfigs.set(configs);
      },
      error: (err) => {
        console.error('Error loading category configs:', err);
      }
    });
  }

  createNewFile() {
    if (!this.selectedCategory || !this.newFileName) return;

    this.blogManagement.fileExists(this.selectedCategory, this.newFileName).subscribe({
      next: (exists) => {
        if (exists) {
          alert('File already exists!');
          return;
        }

        this.blogManagement.createNewFile(this.selectedCategory, this.newFileName).subscribe({
          next: () => {
            alert('File created successfully!');
            this.newFileName = '';
            this.selectedCategory = '';
            this.loadBlogCategories();
          },
          error: (err) => {
            console.error('Error creating file:', err);
            alert('Failed to create file');
          }
        });
      },
      error: (err) => {
        console.error('Error checking file existence:', err);
      }
    });
  }

  editFile(filePath: string) {
    // Navigate to article editor with the file path
    this.router.navigate(['/blog-post'], { queryParams: { path: filePath, edit: true } });
  }

  deleteFile(filePath: string, fileName: string) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    this.blogManagement.deleteFile(filePath).subscribe({
      next: () => {
        alert('File deleted successfully!');
        this.loadBlogCategories();
      },
      error: (err) => {
        console.error('Error deleting file:', err);
        alert('Failed to delete file');
      }
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        // Logout successful, navigation handled by AuthService
      },
      error: (err) => {
        alert('Logout failed: ' + (err.message || 'Unknown error'));
      }
    });
  }
}
