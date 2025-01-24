// src/app/features/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, forkJoin, Observable } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { CartTransaction } from '../../core/models/cart-transaction.model';
import * as CartActions from '../../core/store/actions/cart.actions';
import * as CartSelectors from '../../core/store/selectors/cart.selectors';
import { TransactionDialogComponent } from './dialogs/transaction-dialog.component';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    MatSnackBarModule
  ],
  template: `
    <div class="cart-container">
      <h2>Transaction Cart</h2>

      <div class="cart-summary">
        <p>Total Amount: {{ total$ | async | currency }}</p>
        <p>Transactions: {{ count$ | async }}/10</p>
      </div>

      @if (error$ | async; as error) {
        <div class="error-message">{{ error }}</div>
      }

      <div class="transactions-list">
        @for (transaction of transactions$ | async; track transaction.id) {
          <div class="transaction-item">
            <div class="transaction-details">
              <span>{{ transaction.type }}</span>
              <span>{{ transaction.amount | currency }}</span>
            </div>
            <div class="transaction-actions">
              <button (click)="editTransaction(transaction)">Edit</button>
              <button (click)="removeTransaction(transaction.id)">Remove</button>
            </div>
          </div>
        }
      </div>

      <div class="cart-actions">
        <button
          (click)="addNewTransaction()"
          [disabled]="(isFull$ | async)">
          Add Transaction
        </button>
        <button
          (click)="validateCart()"
          [disabled]="!(count$ | async)">
          Validate Cart
        </button>
        <button
          (click)="clearCart()"
          [disabled]="!(count$ | async)">
          Clear Cart
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  transactions$: Observable<CartTransaction[]>;
  total$: Observable<number>;
  count$: Observable<number>;
  isFull$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {
    this.transactions$ = this.store.select(CartSelectors.selectAllTransactions);
    this.total$ = this.store.select(CartSelectors.selectCartTotal);
    this.count$ = this.store.select(CartSelectors.selectTransactionCount);
    this.isFull$ = this.store.select(CartSelectors.selectIsCartFull);
    this.error$ = this.store.select(CartSelectors.selectCartError);
  }

  ngOnInit() {
    this.loadInitialTransactions();
  }

  private loadInitialTransactions() {
    this.transactionService.getPendingTransactions().subscribe({
      next: (transactions) => {
        this.store.dispatch(CartActions.loadTransactionsSuccess({ transactions }));
      },
      error: (error) => {
        this.store.dispatch(CartActions.setError({
          error: 'Failed to load pending transactions'
        }));
      }
    });
  }

  validateCart() {
    this.transactions$.pipe(take(1)).subscribe(transactions => {
      const processTransactions = transactions.map(transaction =>
        this.transactionService.processTransaction({
          sourceAccountId: transaction.sourceAccountId,
          destinationAccountId: transaction.destinationAccountId,
          amount: transaction.amount,
          type: transaction.type
        })
      );

      forkJoin(processTransactions).subscribe({
        next: () => {
          this.store.dispatch(CartActions.clearCart());
          this.showSuccessMessage('All transactions processed successfully');
        },
        error: (error) => {
          this.store.dispatch(CartActions.setError({
            error: 'Failed to process transactions: ' + error.message
          }));
        }
      });
    });
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  addNewTransaction(): void {
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      data: { transaction: null }
    });

    dialogRef.afterClosed()
      .pipe(filter(result => !!result))
      .subscribe(transaction => {
        this.store.dispatch(CartActions.addTransaction({ transaction }));
      });
  }

  editTransaction(transaction: CartTransaction): void {
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      data: { transaction }
    });

    dialogRef.afterClosed()
      .pipe(filter(result => !!result))
      .subscribe(updates => {
        this.store.dispatch(CartActions.updateTransaction({
          id: transaction.id,
          updates
        }));
      });
  }

  removeTransaction(id: string) {
    this.store.dispatch(CartActions.removeTransaction({ id }));
  }

  clearCart() {
    this.store.dispatch(CartActions.clearCart());
  }
}
