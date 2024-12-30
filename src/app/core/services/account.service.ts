// core/services/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountResponse, AccountCreationRequest, AccountStatus } from '../models/account.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly API_URL = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  createAccount(request: AccountCreationRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(this.API_URL, request);
  }

  getAccountById(id: number): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.API_URL}/${id}`);
  }

  getAccountsByUser(userId: number): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(`${this.API_URL}/user/${userId}`);
  }

  getTotalBalance(userId: number): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/user/${userId}/balance`);
  }

  updateAccountStatus(accountId: number, status: AccountStatus): Observable<AccountResponse> {
    return this.http.put<AccountResponse>(`${this.API_URL}/${accountId}/status`, null, {
      params: { status }
    });
  }
}

