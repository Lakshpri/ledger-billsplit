import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Settlement, SettlementRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettlementService {
  private base(groupId: number) { return `${environment.apiUrl}/groups/${groupId}/settlements`; }

  constructor(private http: HttpClient) {}

  history(groupId: number): Observable<Settlement[]> {
    return this.http.get<Settlement[]>(this.base(groupId));
  }

  record(groupId: number, req: SettlementRequest): Observable<Settlement> {
    return this.http.post<Settlement>(this.base(groupId), req);
  }
}
