// transaction-list.component.ts
import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../../../core/services/transaction.service';
import { TransactionResponse, TransactionStatus, TransactionType } from '../../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="transaction-container">
      <h1>Transaction History</h1>

      <!-- Filters -->
      <form [formGroup]="filterForm" class="filters-section">
        <mat-form-field>
          <mat-label>Search</mat-label>
          <input matInput formControlName="search" placeholder="Search transactions">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option [value]="null">All</mat-option>
            <mat-option *ngFor="let type of transactionTypes" [value]="type">
              {{type}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option [value]="null">All</mat-option>
            <mat-option *ngFor="let status of transactionStatuses" [value]="status">
              {{status}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Date Range</mat-label>
          <mat-date-range-input [rangePicker]="picker">
            <input matStartDate formControlName="startDate" placeholder="Start date">
            <input matEndDate formControlName="endDate" placeholder="End date">
          </mat-date-range-input>
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-date-range-picker #picker></mat-date-range-picker>
        </mat-form-field>
      </form>

      <!-- Transaction Table -->
      <div class="mat-elevation-z8 table-container">
        <table mat-table [dataSource]="transactions()" matSort (matSortChange)="sortData($event)">
          <!-- Transaction ID Column -->
          <ng-container matColumnDef="transactionId">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let transaction">{{transaction.transactionId}}</td>
          </ng-container>

          <!-- Date Column -->
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let transaction">
              {{transaction.createdAt | date:'medium'}}
            </td>
          </ng-container>

          <!-- Type Column -->
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let transaction">
              <span class="transaction-type" [ngClass]="transaction.type.toLowerCase()">
                {{transaction.type}}
              </span>
            </td>
          </ng-container>

          <!-- Amount Column -->
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
            <td mat-cell *matCellDef="let transaction">
              {{transaction.amount | currency}}
            </td>
          </ng-container>

          <!-- Fee Column -->
          <ng-container matColumnDef="fee">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Fee</th>
            <td mat-cell *matCellDef="let transaction">
              {{transaction.fee | currency}}
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let transaction">
              <span class="status-badge" [ngClass]="transaction.status.toLowerCase()">
                {{transaction.status}}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageIndex]="currentPage()"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="handlePageEvent($event)"
          aria-label="Select page">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .transaction-container {
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

      .transaction-type {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;

        &.standard {
          background: #e3f2fd;
          color: #1976d2;
        }

        &.instant {
          background: #fce4ec;
          color: #c2185b;
        }
      }

      .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;

        &.completed {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.pending {
          background: #fff3e0;
          color: #ef6c00;
        }

        &.rejected {
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
export class TransactionListComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private fb = inject(FormBuilder);

  currentSort: Sort | null = null;


  // Add computed signals for pagination
  readonly totalElements = computed(() => this.transactionService.totalElementsCount());
  readonly currentPage = computed(() => this.transactionService.currentPageNumber());


  displayedColumns: string[] = ['transactionId', 'createdAt', 'type', 'amount', 'fee', 'status'];
  transactionTypes = Object.values(TransactionType);
  transactionStatuses = Object.values(TransactionStatus);
  pageSize = 10;

  filterForm: FormGroup = this.fb.group({
    search: [''],
    type: [null],
    status: [null],
    startDate: [null],
    endDate: [null]
  });

  // Signals
  transactions = computed(() => this.transactionService.currentTransactions());
  totalTransactions = computed(() => this.transactions().length);

  ngOnInit() {
    // Initial load with default pagination and sorting
    this.loadInitialTransactions();

    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadInitialTransactions() {
    this.transactionService.getAllTransactions(
      0,
      this.pageSize,
      'createdAt',
      'desc'
    ).subscribe({
      next: () => {
        console.debug('Transactions loaded successfully');
      },
      error: (error) => {
        console.error('Failed to load transactions:', error);
      }
    });
  }

  loadTransactions() {
    this.transactionService.getAllTransactions().subscribe({
      next: () => {
        console.debug('Transactions loaded successfully');
      },
      error: (error) => {
        console.error('Failed to load transactions:', error);
      }
    });
  }

  applyFilters() {
    this.transactionService.getAllTransactionsWithFilters(
      0,
      this.pageSize,
      this.currentSort?.active || 'createdAt',
      this.currentSort?.direction || 'desc',
      this.filterForm.value
    ).subscribe({
      next: () => {
        console.debug('Filtered transactions loaded');
      },
      error: (error) => {
        console.error('Failed to apply filters:', error);
      }
    });
  }

  sortData(sort: Sort) {
    this.currentSort = sort;
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.transactionService.getAllTransactions(
      0,
      this.pageSize,
      sort.active,
      sort.direction
    ).subscribe();
  }

  handlePageEvent(event: PageEvent) {
    this.transactionService.getAllTransactions(
      event.pageIndex,
      event.pageSize,
      this.currentSort?.active || 'createdAt',
      this.currentSort?.direction || 'desc'
    ).subscribe({
      next: () => {
        this.pageSize = event.pageSize;
      },
      error: (error) => {
        console.error('Failed to load transactions:', error);
      }
    });
  }
}

function compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
