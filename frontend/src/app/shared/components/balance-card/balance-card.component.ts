import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberBalance } from '../../../core/models/models';

const STICKY_CLASSES = ['sticky--pink', 'sticky--mint', 'sticky--sky', 'sticky--sand'];

@Component({
  selector: 'app-balance-card',
  standalone: true,
  template: `
    <div class="sticky" [class]="stickyClass">
      <div class="balance-card__top">
        <span class="avatar" [style.background]="balance.user.avatarColor">{{ initials() }}</span>
        <span class="balance-card__name">{{ balance.user.name }}</span>
      </div>
      <div class="balance-card__amount" [class.balance-card__amount--owed]="balance.netAmount > 0" [class.balance-card__amount--owes]="balance.netAmount < 0">
        @if (balance.netAmount > 0) {
          is owed {{ currency }} {{ balance.netAmount | number:'1.2-2' }}
        } @else if (balance.netAmount < 0) {
          owes {{ currency }} {{ -balance.netAmount | number:'1.2-2' }}
        } @else {
          all settled up 🎉
        }
      </div>
    </div>
  `,
  styles: [`
    .balance-card__top {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.6rem;
    }
    .balance-card__name {
      font-family: 'Patrick Hand', cursive;
      font-size: 1.15rem;
    }
    .balance-card__amount {
      font-family: 'Caveat', cursive;
      font-size: 1.4rem;
      font-weight: 700;
    }
    .balance-card__amount--owed { color: var(--success); }
    .balance-card__amount--owes { color: var(--danger); }
  `],
  imports: [CommonModule]
})
export class BalanceCardComponent {
  @Input({ required: true }) balance!: MemberBalance;
  @Input() index = 0;
  @Input() currency = '';

  get stickyClass(): string {
    return STICKY_CLASSES[this.index % STICKY_CLASSES.length];
  }

  initials(): string {
    return this.balance.user.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
