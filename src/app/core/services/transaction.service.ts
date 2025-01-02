import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable, catchError, tap, throwError, of} from 'rxjs';
import { PaginatedResponse } from '../models/api-response.model';

import {
  TransactionResponse,
  TransactionRequest,
  TransactionType,
  TransactionStatus
} from '../models/transaction.model';
import { environment } from '../../../environments/environment';
import {map} from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/transactions`;

  private currentPage = signal<number>(0);
  private pageSize = signal<number>(10);
  private totalElements = signal<number>(0);
  private totalPages = signal<number>(0);

  readonly totalElementsCount = computed(() => this.totalElements());
  readonly currentPageNumber = computed(() => this.currentPage());
  readonly currentPageSize = computed(() => this.pageSize());
  readonly totalPagesCount = computed(() => this.totalPages());

  // Core state signals
  private transactions = signal<TransactionResponse[]>([]);
  private selectedAccountId = signal<number | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);


  getAllTransactions(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Observable<PaginatedResponse<TransactionResponse>> {
    this.isLoading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<PaginatedResponse<TransactionResponse>>(`${this.API_URL}`, { params })
      .pipe(
        tap({
          next: (response) => {
            queueMicrotask(() => {
              this.transactions.set(response.content);
              this.currentPage.set(response.number);
              this.pageSize.set(response.size);
              this.totalElements.set(response.totalElements);
              this.totalPages.set(response.totalPages);
              this.isLoading.set(false);
            });
          },
          error: (err) => {
            queueMicrotask(() => {
              this.error.set('Failed to load transactions');
              this.isLoading.set(false);
            });
            console.error('Error loading transactions:', err);
          }
        })
      );
  }

  getAllTransactionsWithFilters(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    filters: any
  ): Observable<PaginatedResponse<TransactionResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.type) {
      params = params.set('type', filters.type);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate.toISOString());
    }

    return this.http.get<PaginatedResponse<TransactionResponse>>(`${this.API_URL}`, { params })
      .pipe(
        tap({
          next: (response) => {
            queueMicrotask(() => {
              this.transactions.set(response.content);
              this.currentPage.set(response.number);
              this.pageSize.set(response.size);
              this.totalElements.set(response.totalElements);
              this.totalPages.set(response.totalPages);
              this.isLoading.set(false);
            });
          },
          error: (err) => {
            queueMicrotask(() => {
              this.error.set('Failed to load transactions');
              this.isLoading.set(false);
            });
            console.error('Error loading transactions:', err);
          }
        })
      );
  }

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
    if (!accountId) return of([]);

    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<TransactionResponse[]>(`${this.API_URL}/account/${accountId}`).pipe(
      map(transactions => transactions.map(tx => ({
        ...tx,
        createdAt: new Date(tx.createdAt)
      }))),
      tap({
        next: (transactions) => {
          queueMicrotask(() => {
            this.transactions.set(transactions);
            this.isLoading.set(false);
          });
        },
        error: (err) => {
          queueMicrotask(() => {
            this.error.set('Failed to load transactions');
            this.isLoading.set(false);
          });
          console.error('Transaction loading error:', err);
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        return throwError(() => err);
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

  updateTransactions(newTransactions: TransactionResponse[]) {
    this.transactions.set(newTransactions.map(tx => ({
      ...tx,
      createdAt: new Date(tx.createdAt)
    })));
  }
}
