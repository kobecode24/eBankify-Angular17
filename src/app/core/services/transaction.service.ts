// core/services/transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransactionResponse, TransactionRequest, TransactionType, TransactionStatus } from '../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly API_URL = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  createTransaction(request: TransactionRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(this.API_URL, request);
  }

  getTransactionsByAccount(accountId: number): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${this.API_URL}/account/${accountId}`);
  }

  getAccountTransactionHistory(
    accountId: number,
    startDate: Date,
    endDate: Date
  ): Observable<TransactionResponse[]> {
    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<TransactionResponse[]>(`${this.API_URL}/history`, { params });
  }

  calculateDailyTransactions(accountId: number, date: Date): Observable<number> {
    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('date', date.toISOString());

    return this.http.get<number>(`${this.API_URL}/daily-total`, { params });
  }
}
