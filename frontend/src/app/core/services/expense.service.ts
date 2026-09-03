import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, ExpenseRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private base(groupId: number) { return `${environment.apiUrl}/groups/${groupId}/expenses`; }

  constructor(private http: HttpClient) {}

  list(groupId: number): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.base(groupId));
  }

  create(groupId: number, req: ExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(this.base(groupId), req);
  }

  delete(groupId: number, expenseId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(groupId)}/${expenseId}`);
  }
}
