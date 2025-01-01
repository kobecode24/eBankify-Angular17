import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import {
  TransactionResponse,
  TransactionRequest,
  TransactionType,
  TransactionStatus
} from '../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/transactions`;

  // Core state signals
  private transactions = signal<TransactionResponse[]>([]);
  private selectedAccountId = signal<number | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed values
  readonly recentTransactions = computed(() =>
    this.transactions()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
  );

  readonly totalTransactions = computed(() =>
    this.transactions().reduce((sum, tx) => sum + tx.amount, 0)
  );

  readonly pendingTransactions = computed(() =>
    this.transactions().filter(tx => tx.status === TransactionStatus.PENDING)
  );

  constructor() {
    // Effect to log transaction updates
    effect(() => {
      console.debug('Transactions updated:', {
        count: this.transactions().length,
        pending: this.pendingTransactions().length,
        total: this.totalTransactions()
      });
    });
  }

  loadAccountTransactions(accountId: number): Observable<TransactionResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);
    this.selectedAccountId.set(accountId);

    return this.http.get<TransactionResponse[]>(`${this.API_URL}/account/${accountId}`)
      .pipe(
        tap(transactions => {
          this.transactions.set(transactions);
          this.isLoading.set(false);
        }),
        catchError(err => {
          const errorMessage = 'Failed to load transactions';
          this.error.set(errorMessage);
          this.isLoading.set(false);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  createTransaction(request: TransactionRequest): Observable<TransactionResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<TransactionResponse>(this.API_URL, request).pipe(
      tap(transaction => {
        this.transactions.update(txs => [...txs, transaction]);
        this.isLoading.set(false);
      }),
      catchError(err => {
        const errorMessage = 'Failed to create transaction';
        this.error.set(errorMessage);
        this.isLoading.set(false);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getTransactionHistory(
    accountId: number,
    startDate: Date,
    endDate: Date
  ): Observable<TransactionResponse[]> {
    this.isLoading.set(true);

    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<TransactionResponse[]>(`${this.API_URL}/history`, { params })
      .pipe(
        tap(transactions => {
          this.transactions.set(transactions);
          this.isLoading.set(false);
        }),
        catchError(err => {
          const errorMessage = 'Failed to load transaction history';
          this.error.set(errorMessage);
          this.isLoading.set(false);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  calculateDailyTotal(accountId: number, date: Date): Observable<number> {
    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('date', date.toISOString());

    return this.http.get<number>(`${this.API_URL}/daily-total`, { params })
      .pipe(
        catchError(err => {
          const errorMessage = 'Failed to calculate daily total';
          this.error.set(errorMessage);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Public signals for components
  readonly currentTransactions = computed(() => this.transactions());
  readonly loading = computed(() => this.isLoading());
  readonly errorMessage = computed(() => this.error());

  // Utility methods
  clearError(): void {
    this.error.set(null);
  }

  resetTransactions(): void {
    this.transactions.set([]);
  }

  getCurrentAccountId(): number | null {
    return this.selectedAccountId();
  }
}
