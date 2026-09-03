// Shared TypeScript interfaces mirroring the backend DTOs.

export interface User {
  id: number;
  name: string;
  email: string;
  avatarColor: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  icon: string;
  baseCurrency: string;
  createdBy: User;
  members: User[];
  createdAt: string;
}

export interface ExpenseSplitEntry {
  userId: number;
  value: number;
}

export interface ExpenseSplitDto {
  user: User;
  shareAmount: number;
}

export interface Expense {
  id: number;
  description: string;
  category: string;
  amount: number;
  currency: string;
  exchangeRateToBase: number;
  paidBy: User;
  expenseDate: string;
  createdAt: string;
  splits: ExpenseSplitDto[];
}

export interface ExpenseRequest {
  description: string;
  category?: string;
  amount: number;
  currency: string;
  exchangeRateToBase?: number;
  paidByUserId: number;
  expenseDate?: string;
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  participantUserIds?: number[];
  splits?: ExpenseSplitEntry[];
}

export interface Settlement {
  id: number;
  fromUser: User;
  toUser: User;
  amount: number;
  currency: string;
  note?: string;
  settledAt: string;
}

export interface SettlementRequest {
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: string;
  exchangeRateToBase?: number;
  note?: string;
}

export interface MemberBalance {
  user: User;
  netAmount: number;
}

export interface SimplifiedDebt {
  from: User;
  to: User;
  amount: number;
}

export interface BalanceSummary {
  baseCurrency: string;
  netBalances: MemberBalance[];
  simplifiedDebts: SimplifiedDebt[];
}
