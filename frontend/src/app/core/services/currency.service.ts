import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  constructor(private http: HttpClient) {}

  list(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${environment.apiUrl}/currencies`);
  }
}
