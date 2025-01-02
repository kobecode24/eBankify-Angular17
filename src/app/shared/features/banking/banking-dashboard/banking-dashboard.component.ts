import {Component, computed, effect, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from "../../../../core/services/auth.service";
import { AccountService } from "../../../../core/services/account.service";
import { TransactionService } from "../../../../core/services/transaction.service";
import { DashboardLayoutComponent } from "../../../components/dashboard-layout/dashboard-layout.component";
import {AccountResponse, AccountStatus} from "../../../../core/models/account.model";
import { TransactionResponse } from "../../../../core/models/transaction.model";
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-banking-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      <header class="dashboard-header">
        <h1>Welcome, {{user()?.name}}</h1>
        <div class="account-summary">
          <div class="balance-card">
            <h3>Total Balance</h3>
            <p class="balance">{{totalBalance() | currency}}</p>
            @if(accountService.loading()) {
              <span class="loading-indicator">Loading...</span>
            }
          </div>
        </div>
      </header>

      <div class="dashboard-content">
        <section class="accounts-section">
          <h2>Your Accounts</h2>
          @if(accountService.errorMessage()) {
            <div class="error-message">
              {{accountService.errorMessage()}}
            </div>
          }

          <div class="account-list">
            @for(account of accounts(); track account.accountId) {
              <div class="account-card" [class.active]="isAccountActive(account)">
                <div class="account-info">
                  <h4>{{account.userName}}</h4>
                  <p class="account-balance">{{account.balance | currency}}</p>
                  <p class="account-status">{{account.status}}</p>
                </div>
                <div class="account-actions">
                  <button
                    (click)="viewTransactions(account)"
                    [disabled]="transactionService.loading()">
                    View Transactions
                  </button>
                  <button
                    (click)="initiateTransfer(account)"
                    [disabled]="!canInitiateTransfer(account)">
                    Transfer
                  </button>
                </div>
              </div>
            }
            @empty {
              <div class="no-accounts">
                No accounts found. Create your first account to get started.
              </div>
            }
          </div>
        </section>

        <section class="recent-transactions">
          <h2>Recent Transactions</h2>
          @if(transactionService.loading()) {
            <div class="loading">Loading transactions...</div>
          }

          <div class="transaction-list">
            @for(transaction of recentTransactions(); track transaction.transactionId) {
              <div class="transaction-item" [class.credit]="isCredit(transaction)">
                <div class="transaction-details">
          <span class="transaction-date">
            {{formatTransactionDate(transaction.createdAt) | date:'medium':'UTC':'en-US'}}
          </span>
                  <span class="transaction-type" [class]="transaction.type.toLowerCase()">
            {{transaction.type}}
          </span>
                  <span class="transaction-id">ID: {{transaction.transactionId}}</span>
                </div>
                <div class="transaction-amount-details">
          <span class="transaction-amount" [class.credit]="isCredit(transaction)">
            {{(isCredit(transaction) ? '+' : '-') + (transaction.amount | currency)}}
          </span>
                </div>
              </div>
            }
            @empty {
              <div class="no-transactions">
                No recent transactions found.
              </div>
            }
          </div>
        </section>
      </div>
    </app-dashboard-layout>
  `,
  styleUrls: ['./banking-dashboard.component.scss']
})
export class BankingDashboardComponent {
  private readonly auth = inject(AuthService);
  protected readonly accountService = inject(AccountService);
  protected readonly transactionService = inject(TransactionService);
  private readonly selectedAccountForTransactions = signal<number | null>(null);


  // Computed signals
  readonly user = this.auth.user;
  readonly accounts = computed(() => this.accountService.currentAccounts());
  readonly totalBalance = computed(() => this.accountService.totalBalance());
  readonly recentTransactions = computed(() => this.transactionService.currentTransactions());

  constructor() {
    effect(() => {
      const user = this.user();
      if (user?.userId) {
        this.loadAccountData(user.userId);
      }
    });

    const activeAccountId = computed(() => {
      const activeAccounts = this.accounts();
      return activeAccounts.length > 0 ? activeAccounts[0].accountId : null;
    });

    effect(
      () => {
        const accountId = activeAccountId();
        if (accountId) {
          this.selectedAccountForTransactions.set(accountId);
        }
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const selectedAccountId = this.selectedAccountForTransactions();
      if (selectedAccountId) {
        this.loadRecentTransactions(selectedAccountId);
      }
    });
  }

  private loadAccountData(userId: number): void {
    this.accountService.loadUserAccounts(userId).subscribe();
  }

  private loadRecentTransactions(accountId: number): void {
    this.transactionService.loadAccountTransactions(accountId).subscribe();
  }

  protected isAccountActive(account: AccountResponse): boolean {
    return account.status === AccountStatus.ACTIVE;
  }

  protected canInitiateTransfer(account: AccountResponse): boolean {
    return this.isAccountActive(account) && account.balance > 0;
  }

  protected isCredit(transaction: TransactionResponse): boolean {
    const currentAccountId = this.transactionService.getCurrentAccountId();
    return currentAccountId ? transaction.destinationAccountId === currentAccountId : false;
  }

  protected viewTransactions(account: AccountResponse): void {
    // Set the selected account first
    this.selectedAccountForTransactions.set(account.accountId);
    // Then load transactions
    this.transactionService.loadAccountTransactions(account.accountId).subscribe({
      next: () => {
        console.debug('Transactions loaded for account:', account.accountId);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  protected initiateTransfer(account: AccountResponse): void {
    // This will be implemented when we create the transfer dialog
    this.accountService.setSelectedAccount(account.accountId);
    // Add transfer dialog logic here
    // Here you would typically open a transfer dialog
    // For example:
    // this.dialog.open(TransferDialogComponent, {
    //   data: { account }
    // });
  }

  protected formatTransactionDate(date: any): Date {
    if (date instanceof Date) return date;

    // Handle string date
    if (typeof date === 'string') {
      return new Date(date);
    }

    // Handle array format [year, month, day, hour, minute, second]
    if (Array.isArray(date)) {
      const [year, month, day, hour, minute, second] = date;
      return new Date(year, month - 1, day, hour, minute, second);
    }

    // Default fallback
    return new Date();
  }
}
