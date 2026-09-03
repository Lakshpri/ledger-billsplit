import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="nav">
      <a routerLink="/groups" class="nav__brand">
        <span class="nav__brand-icon">📒</span>
        <span class="nav__brand-text">Ledger</span>
      </a>

      @if (auth.isLoggedIn()) {
        <div class="nav__right">
          <div class="nav__user">
            <span class="avatar" [style.background]="auth.currentUser()?.avatarColor">
              {{ initials() }}
            </span>
            <span class="nav__user-name">{{ auth.currentUser()?.name }}</span>
          </div>
          <button class="btn btn--sm" (click)="logout()">Log out</button>
        </div>
      }
    </header>
  `,
  styles: [`
    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 2rem 1.1rem 4.5rem;
      position: relative;
      z-index: 1;
    }
    .nav__brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--ink);
    }
    .nav__brand-icon { font-size: 2rem; transform: rotate(-6deg); display: inline-block; }
    .nav__brand-text {
      font-family: 'Caveat', cursive;
      font-size: 2.1rem;
      font-weight: 700;
    }
    .nav__right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .nav__user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav__user-name {
      font-family: 'Patrick Hand', cursive;
      font-size: 1.05rem;
      display: none;
    }
    @media (min-width: 640px) {
      .nav__user-name { display: inline; }
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  initials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
