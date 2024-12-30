// features/banking/banking-dashboard/banking-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from "../../../../core/services/auth.service";
import {BaseDashboardComponent} from "../../../components/base-dashboard/base-dashboard.component";
import {AccountService} from "../../../../core/services/account.service";
import {TransactionService} from "../../../../core/services/transaction.service";

@Component({
  selector: 'app-banking-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="banking-dashboard">
      <header class="dashboard-header">
        <h1>Welcome, {{currentUser?.name}}</h1>
        <div class="account-summary">
          <div class="balance-card">
            <h3>Total Balance</h3>
            <p class="balance">{{totalBalance | currency}}</p>
          </div>
        </div>
      </header>

      <div class="dashboard-content">
        <section class="accounts-section">
          <h2>Your Accounts</h2>
          <div class="account-list">
            <div *ngFor="let account of accounts" class="account-card">
              <div class="account-info">
                <h4>{{account.accountType}}</h4>
                <p class="account-balance">{{account.balance | currency}}</p>
                <p class="account-number">{{account.accountNumber}}</p>
              </div>
              <div class="account-actions">
                <button (click)="viewTransactions(account)">View Transactions</button>
                <button (click)="initiateTransfer(account)">Transfer</button>
              </div>
            </div>
          </div>
        </section>

        <section class="recent-transactions">
          <h2>Recent Transactions</h2>
          <div class="transaction-list">
            <div *ngFor="let transaction of recentTransactions" class="transaction-item">
              <span class="transaction-date">{{transaction.date | date}}</span>
              <span class="transaction-type">{{transaction.type}}</span>
              <span class="transaction-amount" [class.credit]="transaction.isCredit">
                {{transaction.amount | currency}}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./banking-dashboard.component.scss']
})
export class BankingDashboardComponent extends BaseDashboardComponent implements OnInit {
  accounts = [];
  recentTransactions = [];
  totalBalance = 0;

  constructor(
    authService: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {
    super(authService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.loadAccountData();
    this.loadRecentTransactions();
  }

  private loadAccountData() {
    // Implement account data loading
  }

  private loadRecentTransactions() {
    // Implement transaction loading
  }

  viewTransactions(account: any) {
    // Implement transaction view functionality
  }

  initiateTransfer(account: any) {
    // Implement transfer functionality
  }
}
