import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { GroupService } from '../../../core/services/group.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { BalanceService } from '../../../core/services/balance.service';
import { SettlementService } from '../../../core/services/settlement.service';

import { Group, Expense, BalanceSummary, Settlement } from '../../../core/models/models';

import { BalanceCardComponent } from '../../../shared/components/balance-card/balance-card.component';
import { ExpenseFormComponent } from '../../expenses/expense-form/expense-form.component';
import { SettleUpComponent } from '../../settlements/settle-up.component';

type Tab = 'expenses' | 'balances' | 'history';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BalanceCardComponent, ExpenseFormComponent, SettleUpComponent],
  template: `
    @if (group()) {
      <div class="container">
        <a routerLink="/groups" class="back-link">← all groups</a>

        <div class="group-head">
          <div>
            <h1>{{ group()!.icon }} {{ group()!.name }}</h1>
            @if (group()!.description) { <p class="group-head__desc">{{ group()!.description }}</p> }
          </div>
          <div class="group-head__members">
            @for (m of group()!.members; track m.id) {
              <span class="avatar" [style.background]="m.avatarColor" [title]="m.name">{{ initials(m.name) }}</span>
            }
            <button class="btn btn--sm" (click)="showAddMember.set(true)">+ invite</button>
          </div>
        </div>

        @if (showAddMember()) {
          <div class="invite-row torn-card">
            <input type="email" [(ngModel)]="inviteEmail" placeholder="friend@example.com" />
            <button class="btn btn--sm btn--primary" (click)="addMember()">Add</button>
            <button class="btn btn--sm" (click)="showAddMember.set(false)">Cancel</button>
            @if (inviteError()) { <span class="invite-error">{{ inviteError() }}</span> }
          </div>
        }

        <div class="tabs">
          <button class="tab" [class.tab--active]="tab() === 'expenses'" (click)="tab.set('expenses')">🧾 Expenses</button>
          <button class="tab" [class.tab--active]="tab() === 'balances'" (click)="tab.set('balances')">⚖️ Balances</button>
          <button class="tab" [class.tab--active]="tab() === 'history'" (click)="tab.set('history')">📜 History</button>
        </div>

        <!-- EXPENSES TAB -->
        @if (tab() === 'expenses') {
          <div class="tab-actions">
            <button class="btn btn--primary" (click)="showExpenseForm.set(true)">+ Add expense</button>
          </div>

          @if (expenses().length === 0) {
            <p class="muted">No expenses logged yet. Add the first one!</p>
          } @else {
            <div class="expense-list">
              @for (e of expenses(); track e.id) {
                <div class="expense-row paper-card">
                  <div class="expense-row__main">
                    <div class="expense-row__title">{{ e.description }}</div>
                    <div class="expense-row__meta">
                      {{ e.category }} · paid by {{ e.paidBy.name }} · {{ e.expenseDate }}
                    </div>
                  </div>
                  <div class="expense-row__amount">
                    {{ e.currency }} {{ e.amount | number:'1.2-2' }}
                  </div>
                  <button class="btn btn--sm btn--danger" (click)="deleteExpense(e.id)">✕</button>
                </div>
              }
            </div>
          }
        }

        <!-- BALANCES TAB -->
        @if (tab() === 'balances' && balances()) {
          <h3 class="section-title">Net balances</h3>
          <div class="sticky-grid">
            @for (b of balances()!.netBalances; track b.user.id; let i = $index) {
              <app-balance-card [balance]="b" [index]="i" [currency]="balances()!.baseCurrency"></app-balance-card>
            }
          </div>

          <h3 class="section-title">Simplified settle-up plan</h3>
          @if (balances()!.simplifiedDebts.length === 0) {
            <p class="muted">Everyone's all settled up. Nothing to pay! 🎉</p>
          } @else {
            <div class="debt-list">
              @for (d of balances()!.simplifiedDebts; track d.from.id + '-' + d.to.id) {
                <div class="debt-row torn-card">
                  <span class="avatar" [style.background]="d.from.avatarColor">{{ initials(d.from.name) }}</span>
                  <span class="debt-row__text"><strong>{{ d.from.name }}</strong> pays <strong>{{ d.to.name }}</strong></span>
                  <span class="avatar" [style.background]="d.to.avatarColor">{{ initials(d.to.name) }}</span>
                  <span class="debt-row__amount">{{ balances()!.baseCurrency }} {{ d.amount | number:'1.2-2' }}</span>
                </div>
              }
            </div>
            <button class="btn btn--primary" (click)="showSettleUp.set(true)">Settle up now</button>
          }
        }

        <!-- HISTORY TAB -->
        @if (tab() === 'history') {
          <div class="tab-actions">
            <button class="btn btn--primary" (click)="showSettleUp.set(true)">+ Record payment</button>
          </div>

          @if (settlements().length === 0) {
            <p class="muted">No settlements recorded yet.</p>
          } @else {
            <div class="expense-list">
              @for (s of settlements(); track s.id) {
                <div class="expense-row paper-card">
                  <div class="expense-row__main">
                    <div class="expense-row__title">{{ s.fromUser.name }} → {{ s.toUser.name }}</div>
                    <div class="expense-row__meta">
                      {{ s.settledAt | date:'medium' }} @if (s.note) { · {{ s.note }} }
                    </div>
                  </div>
                  <div class="expense-row__amount expense-row__amount--paid">
                    {{ s.currency }} {{ s.amount | number:'1.2-2' }}
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>

      @if (showExpenseForm()) {
        <app-expense-form
          [group]="group()!"
          (close)="showExpenseForm.set(false)"
          (created)="onExpenseCreated()">
        </app-expense-form>
      }

      @if (showSettleUp()) {
        <app-settle-up
          [group]="group()!"
          [suggestions]="balances()?.simplifiedDebts ?? []"
          (close)="showSettleUp.set(false)"
          (recorded)="onSettlementRecorded()">
        </app-settle-up>
      }
    } @else {
      <div class="container"><p class="muted">Loading group…</p></div>
    }
  `,
  styles: [`
    .back-link {
      display: inline-block;
      font-family: 'Patrick Hand', cursive;
      margin-bottom: 1rem;
      color: var(--ink-soft);
      text-decoration: none;
    }
    .group-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .group-head__desc { color: var(--pencil); margin-top: -0.4rem; }
    .group-head__members { display: flex; align-items: center; gap: -0.4rem; }
    .group-head__members .avatar { margin-left: -8px; border-color: var(--paper-white); }
    .group-head__members button { margin-left: 0.75rem; }

    .invite-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .invite-row input {
      flex: 1;
      min-width: 180px;
      border: none;
      border-bottom: 2px dashed var(--rule);
      background: transparent;
      padding: 0.4rem;
      font-family: 'Nunito Sans', sans-serif;
    }
    .invite-error { color: var(--danger); font-family: 'Patrick Hand', cursive; }

    .tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid var(--rule);
      margin-bottom: 1.5rem;
    }
    .tab {
      font-family: 'Patrick Hand', cursive;
      font-size: 1.1rem;
      background: none;
      border: none;
      padding: 0.6rem 1rem;
      color: var(--pencil);
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
    }
    .tab--active {
      color: var(--ink);
      border-bottom-color: var(--margin);
    }

    .tab-actions { margin-bottom: 1.25rem; }
    .muted { color: var(--pencil); font-family: 'Patrick Hand', cursive; font-size: 1.1rem; }

    .expense-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .expense-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
    }
    .expense-row__main { flex: 1; min-width: 0; }
    .expense-row__title { font-weight: 700; }
    .expense-row__meta { font-size: 0.85rem; color: var(--pencil); }
    .expense-row__amount { font-family: 'Caveat', cursive; font-size: 1.5rem; font-weight: 700; white-space: nowrap; }
    .expense-row__amount--paid { color: var(--success); }

    .section-title { margin-top: 2rem; }
    .sticky-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 1.5rem 1.25rem;
      margin: 1rem 0 2rem;
    }

    .debt-list { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
    .debt-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .debt-row__text { flex: 1; font-family: 'Patrick Hand', cursive; font-size: 1.05rem; }
    .debt-row__amount { font-family: 'Caveat', cursive; font-size: 1.4rem; font-weight: 700; color: var(--margin); }
  `]
})
export class GroupDetailComponent implements OnInit {
  groupId!: number;
  group = signal<Group | null>(null);
  expenses = signal<Expense[]>([]);
  balances = signal<BalanceSummary | null>(null);
  settlements = signal<Settlement[]>([]);

  tab = signal<Tab>('expenses');
  showExpenseForm = signal(false);
  showSettleUp = signal(false);
  showAddMember = signal(false);
  inviteEmail = '';
  inviteError = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private expenseService: ExpenseService,
    private balanceService: BalanceService,
    private settlementService: SettlementService
  ) {}

  ngOnInit(): void {
    this.groupId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  loadAll(): void {
    this.groupService.get(this.groupId).subscribe(g => this.group.set(g));
    this.refreshExpenses();
    this.refreshBalances();
    this.refreshSettlements();
  }

  refreshExpenses(): void {
    this.expenseService.list(this.groupId).subscribe(e => this.expenses.set(e));
  }
  refreshBalances(): void {
    this.balanceService.get(this.groupId).subscribe(b => this.balances.set(b));
  }
  refreshSettlements(): void {
    this.settlementService.history(this.groupId).subscribe(s => this.settlements.set(s));
  }

  onExpenseCreated(): void {
    this.showExpenseForm.set(false);
    this.refreshExpenses();
    this.refreshBalances();
  }

  onSettlementRecorded(): void {
    this.showSettleUp.set(false);
    this.refreshBalances();
    this.refreshSettlements();
  }

  deleteExpense(expenseId: number): void {
    if (!confirm('Delete this expense?')) return;
    this.expenseService.delete(this.groupId, expenseId).subscribe(() => {
      this.refreshExpenses();
      this.refreshBalances();
    });
  }

  addMember(): void {
    if (!this.inviteEmail.trim()) return;
    this.inviteError.set(null);
    this.groupService.addMember(this.groupId, this.inviteEmail.trim()).subscribe({
      next: (g) => {
        this.group.set(g);
        this.inviteEmail = '';
        this.showAddMember.set(false);
      },
      error: (err) => this.inviteError.set(err?.error?.message ?? 'Could not add that member.')
    });
  }

  initials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
