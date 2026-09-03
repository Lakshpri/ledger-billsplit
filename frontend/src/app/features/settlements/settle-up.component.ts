import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettlementService } from '../../core/services/settlement.service';
import { Group, SimplifiedDebt } from '../../core/models/models';

@Component({
  selector: 'app-settle-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="backdrop" (click)="close.emit()">
      <div class="modal torn-card" (click)="$event.stopPropagation()">
        <span class="tape">settle up</span>
        <h2>Record a payment</h2>

        @if (error()) {
          <div class="error-note">{{ error() }}</div>
        }

        @if (suggestions.length > 0) {
          <p class="hint">Tap a suggestion to fill it in, or enter your own below.</p>
          <div class="suggestions">
            @for (s of suggestions; track s.from.id + '-' + s.to.id) {
              <button type="button" class="chip" (click)="applySuggestion(s)">
                {{ s.from.name }} → {{ s.to.name }}: {{ group.baseCurrency }} {{ s.amount | number:'1.2-2' }}
              </button>
            }
          </div>
        }

        <form (ngSubmit)="submit()">
          <div class="row">
            <div class="field">
              <label for="from">From</label>
              <select id="from" name="from" [(ngModel)]="fromUserId">
                @for (m of group.members; track m.id) { <option [ngValue]="m.id">{{ m.name }}</option> }
              </select>
            </div>
            <div class="field">
              <label for="to">To</label>
              <select id="to" name="to" [(ngModel)]="toUserId">
                @for (m of group.members; track m.id) { <option [ngValue]="m.id">{{ m.name }}</option> }
              </select>
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label for="amount">Amount</label>
              <input id="amount" name="amount" type="number" min="0.01" step="0.01" [(ngModel)]="amount" required />
            </div>
            <div class="field">
              <label for="currency">Currency</label>
              <input id="currency" name="currency" type="text" [(ngModel)]="currency" maxlength="3" />
            </div>
          </div>

          <div class="field">
            <label for="note">Note (optional)</label>
            <input id="note" name="note" type="text" [(ngModel)]="note" placeholder="Paid via UPI" />
          </div>

          <div class="modal__actions">
            <button type="button" class="btn" (click)="close.emit()">Cancel</button>
            <button type="submit" class="btn btn--primary" [disabled]="loading()">
              {{ loading() ? 'Recording…' : 'Record payment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(43, 58, 85, 0.35);
      display: flex; align-items: flex-start; justify-content: center;
      padding: 3rem 1rem;
      overflow-y: auto;
      z-index: 50;
    }
    .modal { max-width: 440px; width: 100%; }
    .row { display: flex; gap: 1rem; }
    .row .field { flex: 1; }
    .hint { color: var(--pencil); font-size: 0.9rem; margin-bottom: 0.5rem; }
    .suggestions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
    .chip { cursor: pointer; background: var(--sticky-sand); }
    .modal__actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }
  `]
})
export class SettleUpComponent implements OnInit {
  @Input({ required: true }) group!: Group;
  @Input() suggestions: SimplifiedDebt[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() recorded = new EventEmitter<void>();

  fromUserId!: number;
  toUserId!: number;
  amount: number | null = null;
  currency = 'USD';
  note = '';

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private settlementService: SettlementService) {}

  ngOnInit(): void {
    this.currency = this.group.baseCurrency;
    if (this.suggestions.length > 0) {
      this.applySuggestion(this.suggestions[0]);
    } else {
      this.fromUserId = this.group.members[0]?.id;
      this.toUserId = this.group.members[1]?.id ?? this.group.members[0]?.id;
    }
  }

  applySuggestion(s: SimplifiedDebt): void {
    this.fromUserId = s.from.id;
    this.toUserId = s.to.id;
    this.amount = s.amount;
    this.currency = this.group.baseCurrency;
  }

  submit(): void {
    if (!this.amount || this.amount <= 0) {
      this.error.set('Enter a valid amount.');
      return;
    }
    if (this.fromUserId === this.toUserId) {
      this.error.set('"From" and "to" must be different people.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.settlementService.record(this.group.id, {
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      amount: this.amount,
      currency: this.currency,
      exchangeRateToBase: this.currency === this.group.baseCurrency ? 1 : undefined,
      note: this.note || undefined
    }).subscribe({
      next: () => { this.loading.set(false); this.recorded.emit(); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Could not record this payment.');
      }
    });
  }
}
