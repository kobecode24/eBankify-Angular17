import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, tap } from 'rxjs';
import { AccountResponse, AccountCreationRequest, AccountStatus } from '../models/account.model';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/accounts`;

  // Core state signals
  accounts = signal<AccountResponse[]>([]);
  private selectedAccount = signal<AccountResponse | null>(null);
  isLoading = signal(false);
  private error = signal<string | null>(null);

  // Computed states
  readonly totalBalance = computed(() =>
    this.accounts().reduce((sum, account) => sum + account.balance, 0)
  );

  readonly activeAccounts = computed(() =>
    this.accounts().filter(account => account.status === AccountStatus.ACTIVE)
  );

  readonly accountsCount = computed(() => this.accounts().length);

  constructor() {
    // Effect to log account changes
    effect(() => {
      console.debug('Accounts updated:', {
        total: this.accountsCount(),
        active: this.activeAccounts().length,
        balance: this.totalBalance()
      });
    });
  }

  loadUserAccounts(userId: number): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(`${this.API_URL}/user/${userId}`).pipe(
      tap({
        next: (accounts) => {
          queueMicrotask(() => {
            this.accounts.set(accounts);
            this.isLoading.set(false);
          });
        },
        error: (error) => {
          queueMicrotask(() => {
            this.error.set('Failed to load accounts');
            this.isLoading.set(false);
          });
        }
      })
    );
  }

  createAccount(request: AccountCreationRequest): Observable<AccountResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<AccountResponse>(this.API_URL, request).pipe(
      tap(newAccount => {
        this.accounts.update(accounts => [...accounts, newAccount]);
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.error.set('Failed to create account');
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  getAccountById(id: number): Observable<AccountResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<AccountResponse>(`${this.API_URL}/${id}`).pipe(
      tap(account => {
        this.selectedAccount.set(account);
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.error.set('Failed to load account details');
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  updateAccountStatus(accountId: number, status: AccountStatus): Observable<AccountResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<AccountResponse>(`${this.API_URL}/${accountId}/status`, null, {
      params: { status }
    }).pipe(
      tap(updatedAccount => {
        this.accounts.update(accounts =>
          accounts.map(account =>
            account.accountId === accountId ? updatedAccount : account
          )
        );
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.error.set('Failed to update account status');
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  // Public signals for components
  readonly currentAccounts = computed(() => this.accounts());
  readonly selectedAccountDetails = computed(() => this.selectedAccount());
  readonly loading = computed(() => this.isLoading());
  readonly errorMessage = computed(() => this.error());

  // Utility methods
  getAccountBalance(accountId: number): number {
    const account = this.accounts().find(a => a.accountId === accountId);
    return account?.balance || 0;
  }

  isAccountActive(accountId: number): boolean {
    const account = this.accounts().find(a => a.accountId === accountId);
    return account?.status === AccountStatus.ACTIVE;
  }

  clearSelectedAccount(): void {
    this.selectedAccount.set(null);
  }

  resetError(): void {
    this.error.set(null);
  }

  // Add this method to your AccountService class
  setSelectedAccount(accountId: number): void {
    const account = this.accounts().find(a => a.accountId === accountId);
    if (account) {
      this.selectedAccount.set(account);
    }
  }
}
//
