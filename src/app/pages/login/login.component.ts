// src/app/components/login/login.component.ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Login</h2>
    <form (ngSubmit)="onLogin()">
      <div style="margin-bottom: 10px;">
        <label for="email">Email:</label>
        <input id="email" type="email" [(ngModel)]="email" name="email" required>
      </div>
      <div style="margin-bottom: 10px;">
        <label for="password">Password:</label>
        <input id="password" type="password" [(ngModel)]="password" name="password" required>
      </div>
      <button type="submit">Login</button>
      @if (errorMessage) {
        <p style="color: red;">{{ errorMessage }}</p>
      }
    </form>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    input {
      width: calc(100% - 20px);
      padding: 8px;
      margin-top: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      padding: 10px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class LoginComponent {
  email!: string;
  password!: string;
  errorMessage: string | null = null;

  private authService = inject(AuthService);

  onLogin() {
    this.errorMessage = null; // Clear previous errors
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        // Login successful, navigation handled by AuthService
      },
      error: (err) => {
        this.errorMessage = err.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
