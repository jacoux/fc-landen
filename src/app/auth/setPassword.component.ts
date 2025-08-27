import {Component, OnInit, signal, computed, effect, inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {first} from 'rxjs'; // Zorg dat dit pad correct is

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container">
      <h2 *ngIf="email()">Stel je wachtwoord in voor {{ email() }}</h2>
      <h2 *ngIf="!email()">Stel je wachtwoord in</h2>

      <form (ngSubmit)="handleSetPassword()">
        <div>
          <label for="password">Wachtwoord:</label>
          <input
            type="password"
            id="password"
            [(ngModel)]="password"
            name="password"
            required
            minlength="8"
            maxlength="128"
          />
        </div>
        <div>
          <label for="confirmPassword">Bevestig Wachtwoord:</label>
          <input
            type="password"
            id="confirmPassword"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            required
          />
          <p *ngIf="!passwordsMatch() && confirmPassword.length > 0" class="error-message">Wachtwoorden komen niet overeen.</p>
        </div>
        <button type="submit" [disabled]="loading() || !passwordsMatch() || !password || !confirmPassword">
          {{ loading() ? 'Bezig...' : 'Account Registreren' }}
        </button>
      </form>
      <p *ngIf="message()" [class.success]="isSuccess()" [class.error]="!isSuccess()">{{ message() }}</p>
    </div>
  `,
  styles: [`
    .container {
      max-width: 500px;
      margin: 50px auto;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      background-color: #ffffff;
      font-family: Arial, sans-serif;
    }
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 25px;
    }
    div {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: #555;
    }
    input[type="password"] {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-sizing: border-box;
      font-size: 16px;
    }
    button {
      width: 100%;
      padding: 12px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 18px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      margin-top: 20px;
    }
    button:hover:not(:disabled) {
      background-color: #0056b3;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .success {
      color: green;
      text-align: center;
      margin-top: 20px;
      font-weight: bold;
    }
    .error {
      color: red;
      text-align: center;
      margin-top: 20px;
      font-weight: bold;
    }
    .error-message {
      color: red;
      font-size: 14px;
      margin-top: 5px;
    }
  `]
})
export class SetPasswordComponent implements OnInit {
  email = signal<string | null>(null);
  password = signal<string>('');
  confirmPassword = signal<string>('');
  token = signal<string | null>(null); // Het token van de callback (Access Token)
  message = signal<string>('');
  isSuccess = signal<boolean>(false);
  loading = signal<boolean>(false);

  passwordsMatch = computed(() => this.password() === this.confirmPassword());

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  constructor() {
    // Effect om query parameters te lezen bij initialisatie
    effect(() => {
      // route.queryParams is een Observable, dus we moeten nog steeds subscribe gebruiken,
      // of het converteren naar een signal indien gewenst met bijv. toSignal (vanaf Angular 17.1)
      this.route.queryParams.subscribe(params => {
        this.email.set(params['email'] || null);
        this.token.set(params['token'] || null); // Access Token
        if (!this.email() || !this.token()) {
          this.message.set('Ongeldige toegang. Keer terug naar de startpagina.');
          this.isSuccess.set(false);
          // Stuur gebruiker terug als er geen e-mail of token is
          this.router.navigate(['/enter-email']);
        }
      });
    }, { allowSignalWrites: true }); // allowSignalWrites is nodig omdat we signals bijwerken binnen een effect
  }

  // ngOnInit blijft voor andere initialisatielogica indien nodig
  ngOnInit(): void {
    // Geen abonnementslogica hier meer, dat is nu in het effect.
  }

  async handleSetPassword(): Promise<void> {
    this.message.set('');
    this.isSuccess.set(false);
    this.loading.set(true);

    if (!this.passwordsMatch()) {
      this.message.set('Wachtwoorden komen niet overeen!');
      this.isSuccess.set(false);
      this.loading.set(false);
      return;
    }

    if (!this.password() || this.password().length < 8) {
      this.message.set('Wachtwoord moet minimaal 8 tekens lang zijn.');
      this.isSuccess.set(false);
      this.loading.set(false);
      return;
    }

    try {
      await this.http.post(`${environment.backendApiUrl}/register-password`, {
        email: this.email(),
        password: this.password(),
        idToken: this.token() // Stuur het Access Token mee, want dit is je bewijs van authenticatie
      }).pipe(first());

      this.message.set('Account succesvol geregistreerd! Je kunt nu inloggen.');
      this.isSuccess.set(true);
      this.router.navigate(['/login']); // Navigeer naar je login pagina
    } catch (error: any) {
      console.error('Fout bij registreren/wachtwoord instellen:', error);
      this.message.set(`Registratie mislukt: ${error.error?.message || 'Er ging iets mis.'}`);
      this.isSuccess.set(false);
    } finally {
      this.loading.set(false);
    }
  }
}
