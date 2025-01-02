// account-list.component.ts
import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../../../core/services/account.service';
import { AccountResponse, AccountStatus } from '../../../../core/models/account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="account-container">
      <h1>Account Management</h1>

      <!-- Filters -->
      <form [formGroup]="filterForm" class="filters-section">
        <mat-form-field>
          <mat-label>Search</mat-label>
          <input matInput formControlName="search" placeholder="Search accounts">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option [value]="null">All</mat-option>
            <mat-option *ngFor="let status of accountStatuses" [value]="status">
              {{status}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Minimum Balance</mat-label>
          <input matInput type="number" formControlName="minBalance">
        </mat-form-field>
      </form>

      <!-- Account Table -->
      <div class="mat-elevation-z8 table-container">
        <table mat-table [dataSource]="accounts()" matSort (matSortChange)="sortData($event)">
          <ng-container matColumnDef="accountId">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Account ID</th>
            <td mat-cell *matCellDef="let account">{{account.accountId}}</td>
          </ng-container>

          <ng-container matColumnDef="userName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Account Holder</th>
            <td mat-cell *matCellDef="let account">{{account.userName}}</td>
          </ng-container>

          <ng-container matColumnDef="balance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Balance</th>
            <td mat-cell *matCellDef="let account">{{account.balance | currency}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let account">
              <span class="status-badge" [ngClass]="account.status.toLowerCase()">
                {{account.status}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let account">
              <button mat-icon-button (click)="viewDetails(account)">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button (click)="toggleStatus(account)">
                <mat-icon>{{account.status === 'ACTIVE' ? 'block' : 'check_circle'}}</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="handlePageEvent($event)"
          aria-label="Select page">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .account-container {
      padding: 2rem;

      h1 {
        margin-bottom: 2rem;
        color: #1976d2;
      }
    }

    .filters-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .table-container {
      table {
        width: 100%;
      }

      .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;

        &.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.blocked {
          background: #ffebee;
          color: #c62828;
        }
      }
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class AccountListComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  displayedColumns = ['accountId', 'userName', 'balance', 'status', 'actions'];
  accountStatuses = Object.values(AccountStatus);
  pageSize = 10;

  filterForm: FormGroup = this.fb.group({
    search: [''],
    status: [null],
    minBalance: [null]
  });

  accounts = computed(() => this.accountService.currentAccounts());
  totalElements = computed(() => this.accounts().length);

  ngOnInit() {
    this.loadAccounts();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadAccounts() {
    this.accountService.getAllAccounts().subscribe({
      next: () => {
        console.debug('Accounts loaded successfully');
      },
      error: (error) => {
        console.error('Failed to load accounts:', error);
      }
    });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    // Implement filtering logic
  }

  sortData(sort: Sort) {
    const data = [...this.accounts()];
    if (!sort.active || sort.direction === '') {
      return;
    }

    const sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'accountId': return compare(a.accountId, b.accountId, isAsc);
        case 'userName': return compare(a.userName, b.userName, isAsc);
        case 'balance': return compare(a.balance, b.balance, isAsc);
        case 'status': return compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });

    this.accountService.updateAccounts(sortedData);
  }

  handlePageEvent(event: PageEvent) {
    // Implement pagination logic
  }

  viewDetails(account: AccountResponse) {
    // Implement view details logic
  }

  toggleStatus(account: AccountResponse) {
    const newStatus = account.status === AccountStatus.ACTIVE ?
      AccountStatus.BLOCKED : AccountStatus.ACTIVE;

    this.accountService.updateAccountStatus(account.accountId, newStatus)
      .subscribe({
        next: () => {
          console.debug('Account status updated successfully');
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Failed to update account status:', error);
        }
      });
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
