import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly baseUrl = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) {}

  list(): Observable<Group[]> {
    return this.http.get<Group[]>(this.baseUrl);
  }

  get(groupId: number): Observable<Group> {
    return this.http.get<Group>(`${this.baseUrl}/${groupId}`);
  }

  create(payload: { name: string; description?: string; icon?: string; baseCurrency?: string; memberEmails?: string[] }): Observable<Group> {
    return this.http.post<Group>(this.baseUrl, payload);
  }

  addMember(groupId: number, email: string): Observable<Group> {
    return this.http.post<Group>(`${this.baseUrl}/${groupId}/members`, { email });
  }
}
