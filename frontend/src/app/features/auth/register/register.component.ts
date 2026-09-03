import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card torn-card">
        <span class="tape auth-card__tape">new page</span>
        <h1>Start a fresh notebook</h1>
        <p class="auth-card__sub">Track shared bills without the awkward maths.</p>

        @if (error()) {
          <div class="error-note">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" type="text" name="name" [(ngModel)]="name" required placeholder="Priya Sharma" />
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" [(ngModel)]="email" required autocomplete="email" placeholder="you@example.com" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" [(ngModel)]="password" required minlength="6" autocomplete="new-password" placeholder="at least 6 characters" />
          </div>
          <button class="btn btn--primary btn--block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="auth-card__switch">
          Already have a notebook? <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 90px);
      padding: 2rem 1.5rem;
    }
    .auth-card {
      max-width: 380px;
      width: 100%;
      position: relative;
    }
    .auth-card__tape {
      position: absolute;
      top: -14px;
      left: 24px;
    }
    .auth-card__sub {
      color: var(--pencil);
      margin-top: -0.5rem;
      margin-bottom: 1.5rem;
    }
    .auth-card__switch {
      text-align: center;
      font-family: 'Patrick Hand', cursive;
      margin-top: 1rem;
    }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    if (!this.name || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/groups']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Could not create your account. Try a different email.');
      }
    });
  }
}
