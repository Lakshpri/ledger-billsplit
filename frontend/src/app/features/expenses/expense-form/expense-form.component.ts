import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { Group, User } from '../../../core/models/models';

interface SplitRow {
  user: User;
  include: boolean;
  exactValue: number;
  percentValue: number;
}

const CATEGORIES = ['General', 'Food', 'Travel', 'Rent', 'Groceries', 'Fun', 'Utilities', 'Shopping'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD', 'AED', 'CNY'];

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="backdrop" (click)="close.emit()">
      <div class="modal torn-card" (click)="$event.stopPropagation()">
        <span class="tape">new receipt</span>
        <h2>Add an expense</h2>

        @if (error()) {
          <div class="error-note">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()">
          <div class="field">
            <label for="desc">What was it for?</label>
            <input id="desc" name="desc" type="text" [(ngModel)]="description" required placeholder="Dinner at the beach shack" />
          </div>

          <div class="row">
            <div class="field">
              <label for="amount">Amount</label>
              <input id="amount" name="amount" type="number" min="0.01" step="0.01" [(ngModel)]="amount" required />
            </div>
            <div class="field">
              <label for="currency">Currency</label>
              <select id="currency" name="currency" [(ngModel)]="currency">
                @for (c of currencies; track c) { <option [value]="c">{{ c }}</option> }
              </select>
            </div>
          </div>

          @if (currency !== group.baseCurrency) {
            <div class="field">
              <label for="rate">Exchange rate to {{ group.baseCurrency }} (1 {{ currency }} = ? {{ group.baseCurrency }})</label>
              <input id="rate" name="rate" type="number" min="0" step="0.0001" [(ngModel)]="exchangeRate" />
            </div>
          }

          <div class="row">
            <div class="field">
              <label for="category">Category</label>
              <select id="category" name="category" [(ngModel)]="category">
                @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
              </select>
            </div>
            <div class="field">
              <label for="paidBy">Paid by</label>
              <select id="paidBy" name="paidBy" [(ngModel)]="paidByUserId">
                @for (m of group.members; track m.id) { <option [ngValue]="m.id">{{ m.name }}</option> }
              </select>
            </div>
          </div>

          <div class="field">
            <label for="date">Date</label>
            <input id="date" name="date" type="date" [(ngModel)]="expenseDate" />
          </div>

          <div class="field">
            <label>Split</label>
            <div class="split-tabs">
              <button type="button" class="chip" [class.chip--active]="splitType==='EQUAL'" (click)="splitType='EQUAL'">Equally</button>
              <button type="button" class="chip" [class.chip--active]="splitType==='EXACT'" (click)="splitType='EXACT'">Exact amounts</button>
              <button type="button" class="chip" [class.chip--active]="splitType==='PERCENTAGE'" (click)="splitType='PERCENTAGE'">Percentages</button>
            </div>
          </div>

          <div class="split-rows">
            @for (row of rows; track row.user.id) {
              <div class="split-row">
                <label class="split-row__member">
                  @if (splitType === 'EQUAL') {
                    <input type="checkbox" [(ngModel)]="row.include" [name]="'inc'+row.user.id" />
                  }
                  <span class="avatar avatar--sm" [style.background]="row.user.avatarColor">{{ initials(row.user.name) }}</span>
                  {{ row.user.name }}
                </label>

                @if (splitType === 'EXACT') {
                  <input type="number" min="0" step="0.01" class="split-row__input" [(ngModel)]="row.exactValue" [name]="'exact'+row.user.id" />
                } @else if (splitType === 'PERCENTAGE') {
                  <input type="number" min="0" max="100" step="0.1" class="split-row__input" [(ngModel)]="row.percentValue" [name]="'pct'+row.user.id" />
                  <span class="split-row__pct-symbol">%</span>
                }
              </div>
            }
          </div>

          @if (splitType === 'EXACT') {
            <p class="split-total" [class.split-total--bad]="!exactMatches()">
              Splits total: {{ exactTotal() | number:'1.2-2' }} / {{ amount | number:'1.2-2' }}
            </p>
          }
          @if (splitType === 'PERCENTAGE') {
            <p class="split-total" [class.split-total--bad]="!percentMatches()">
              Percentages total: {{ percentTotal() | number:'1.0-1' }}% / 100%
            </p>
          }

          <div class="modal__actions">
            <button type="button" class="btn" (click)="close.emit()">Cancel</button>
            <button type="submit" class="btn btn--primary" [disabled]="loading()">
              {{ loading() ? 'Saving…' : 'Save expense' }}
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
    .modal { max-width: 480px; width: 100%; }
    .row { display: flex; gap: 1rem; }
    .row .field { flex: 1; }
    .split-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .chip { background: var(--paper-white); cursor: pointer; }
    .chip--active { background: var(--ink); color: var(--paper-white); }
    .split-rows { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.75rem 0 0.5rem; }
    .split-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
    .split-row__member { display: flex; align-items: center; gap: 0.5rem; font-family: 'Patrick Hand', cursive; font-size: 1.05rem; }
    .avatar--sm { width: 26px; height: 26px; font-size: 0.75rem; }
    .split-row__input { width: 90px; padding: 0.3rem 0.5rem; border: none; border-bottom: 2px dashed var(--rule); background: transparent; text-align: right; }
    .split-row__pct-symbol { font-family: 'Patrick Hand', cursive; }
    .split-total { font-family: 'Patrick Hand', cursive; color: var(--success); }
    .split-total--bad { color: var(--danger); }
    .modal__actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }
  `]
})
export class ExpenseFormComponent implements OnInit {
  @Input({ required: true }) group!: Group;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  categories = CATEGORIES;
  currencies = CURRENCIES;

  description = '';
  amount: number | null = null;
  currency = 'USD';
  exchangeRate = 1;
  category = 'General';
  paidByUserId!: number;
  expenseDate = new Date().toISOString().substring(0, 10);
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE' = 'EQUAL';
  rows: SplitRow[] = [];

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.currency = this.group.baseCurrency;
    this.paidByUserId = this.group.members[0]?.id;
    this.rows = this.group.members.map(m => ({
      user: m, include: true, exactValue: 0, percentValue: +(100 / this.group.members.length).toFixed(1)
    }));
  }

  initials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  exactTotal(): number {
    return +this.rows.reduce((sum, r) => sum + (Number(r.exactValue) || 0), 0).toFixed(2);
  }
  exactMatches(): boolean {
    return Math.abs(this.exactTotal() - Number(this.amount || 0)) < 0.01;
  }
  percentTotal(): number {
    return +this.rows.reduce((sum, r) => sum + (Number(r.percentValue) || 0), 0).toFixed(1);
  }
  percentMatches(): boolean {
    return Math.abs(this.percentTotal() - 100) < 0.1;
  }

  submit(): void {
    if (!this.description.trim() || !this.amount || this.amount <= 0) {
      this.error.set('Add a description and a valid amount.');
      return;
    }

    const req: any = {
      description: this.description,
      category: this.category,
      amount: this.amount,
      currency: this.currency,
      exchangeRateToBase: this.currency === this.group.baseCurrency ? 1 : this.exchangeRate,
      paidByUserId: this.paidByUserId,
      expenseDate: this.expenseDate,
      splitType: this.splitType
    };

    if (this.splitType === 'EQUAL') {
      const participants = this.rows.filter(r => r.include).map(r => r.user.id);
      if (participants.length === 0) {
        this.error.set('Pick at least one person to split with.');
        return;
      }
      req.participantUserIds = participants;
    } else if (this.splitType === 'EXACT') {
      if (!this.exactMatches()) {
        this.error.set('Exact amounts must add up to the total.');
        return;
      }
      req.splits = this.rows.filter(r => r.exactValue > 0).map(r => ({ userId: r.user.id, value: r.exactValue }));
    } else {
      if (!this.percentMatches()) {
        this.error.set('Percentages must add up to 100.');
        return;
      }
      req.splits = this.rows.filter(r => r.percentValue > 0).map(r => ({ userId: r.user.id, value: r.percentValue }));
    }

    this.loading.set(true);
    this.error.set(null);

    this.expenseService.create(this.group.id, req).subscribe({
      next: () => { this.loading.set(false); this.created.emit(); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Could not save this expense.');
      }
    });
  }
}
