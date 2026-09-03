import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';

const ICONS = ['📒', '🏖️', '🏠', '🍕', '🎉', '🚗', '💼', '🎓', '🏔️', '🍻'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD', 'AED', 'CNY'];

@Component({
  selector: 'app-group-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container container--narrow">
      <a routerLink="/groups" class="back-link">← back to groups</a>
      <div class="torn-card">
        <span class="tape">new notebook</span>
        <h1>Start a new group</h1>

        @if (error()) {
          <div class="error-note">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()">
          <div class="field">
            <label>Icon</label>
            <div class="icon-picker">
              @for (i of icons; track i) {
                <button type="button" class="icon-picker__btn" [class.icon-picker__btn--active]="icon === i" (click)="icon = i">{{ i }}</button>
              }
            </div>
          </div>

          <div class="field">
            <label for="name">Group name</label>
            <input id="name" type="text" name="name" [(ngModel)]="name" required placeholder="Goa Trip 2026" />
          </div>

          <div class="field">
            <label for="description">Description (optional)</label>
            <input id="description" type="text" name="description" [(ngModel)]="description" placeholder="4 days, 5 friends, one very cursed AirBnB" />
          </div>

          <div class="field">
            <label for="currency">Base currency</label>
            <select id="currency" name="currency" [(ngModel)]="baseCurrency">
              @for (c of currencies; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <div class="field">
            <label for="emails">Invite members by email (comma separated, optional)</label>
            <input id="emails" type="text" name="emails" [(ngModel)]="emailsRaw" placeholder="friend1@mail.com, friend2@mail.com" />
            <small class="hint">They need an existing Ledger account — you can also add people later from the group page.</small>
          </div>

          <button class="btn btn--primary btn--block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Creating…' : 'Create group' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container--narrow { max-width: 560px; }
    .back-link {
      display: inline-block;
      font-family: 'Patrick Hand', cursive;
      margin-bottom: 1rem;
      color: var(--ink-soft);
      text-decoration: none;
    }
    .icon-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .icon-picker__btn {
      font-size: 1.4rem;
      background: var(--paper);
      border: 2px solid transparent;
      border-radius: 8px;
      padding: 0.3rem 0.5rem;
    }
    .icon-picker__btn--active {
      border-color: var(--ink);
      background: var(--sticky-sand);
    }
    .hint {
      color: var(--pencil);
      font-size: 0.85rem;
    }
  `]
})
export class GroupCreateComponent {
  icons = ICONS;
  currencies = CURRENCIES;

  name = '';
  description = '';
  icon = ICONS[0];
  baseCurrency = 'USD';
  emailsRaw = '';

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private groupService: GroupService, private router: Router) {}

  submit(): void {
    if (!this.name.trim()) return;
    this.loading.set(true);
    this.error.set(null);

    const memberEmails = this.emailsRaw
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    this.groupService.create({
      name: this.name,
      description: this.description || undefined,
      icon: this.icon,
      baseCurrency: this.baseCurrency,
      memberEmails
    }).subscribe({
      next: (group) => this.router.navigate(['/groups', group.id]),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Could not create the group.');
      }
    });
  }
}
