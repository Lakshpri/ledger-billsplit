import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BalanceSummary } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  constructor(private http: HttpClient) {}

  get(groupId: number): Observable<BalanceSummary> {
    return this.http.get<BalanceSummary>(`${environment.apiUrl}/groups/${groupId}/balances`);
  }
}
