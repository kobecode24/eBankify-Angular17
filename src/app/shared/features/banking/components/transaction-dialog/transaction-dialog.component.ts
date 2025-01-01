import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from "../../../../../core/services/account.service";
import { TransactionService } from "../../../../../core/services/transaction.service";
import { TransactionRequest, TransactionType } from "../../../../../core/models/transaction.model";
import {Dialog} from "@angular/cdk/dialog";


@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="transaction-dialog">
      <h2>New Transfer</h2>

      @if (accounts.isLoading()) {
        <div class="loading">Loading accounts...</div>
      } @else {
        <form [formGroup]="transferForm" (ngSubmit)="submitTransfer()">
          <div class="form-group">
            <label>From Account</label>
            <select formControlName="sourceAccountId">
              @for (account of accounts.accounts(); track account.accountId) {
                <option [value]="account.accountId">
                  {{account.accountId}} - Balance: {{account.balance | currency}}
                </option>
              }
            </select>
          </div>

          <div class="form-group">
            <label>To Account</label>
            <input type="number" formControlName="destinationAccountId"
                   placeholder="Enter destination account number">
          </div>

          <div class="form-group">
            <label>Amount</label>
            <input type="number" formControlName="amount"
                   [max]="maxTransferAmount()" step="0.01">
          </div>

          <div class="form-group">
            <label>Transfer Type</label>
            <select formControlName="type">
              <option [ngValue]="TransactionType.STANDARD">Standard</option>
              <option [ngValue]="TransactionType.INSTANT">Instant</option>
            </select>
          </div>

          @if (transactions.error()) {
            <div class="error-message">{{transactions.error()}}</div>
          }

          <div class="dialog-actions">
            <button type="button" (click)="closeDialog()">Cancel</button>
            <button type="submit"
                    [disabled]="!transferForm.valid || transactions.isLoading()">
              @if (transactions.isLoading()) {
                Processing...
              } @else {
                Transfer
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .transaction-dialog {
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .error-message {
      color: red;
      margin: 1rem 0;
    }
  `]
})
export class TransactionDialogComponent {
  private fb = inject(FormBuilder);
  private dialog = inject(Dialog);
  protected accounts = inject(AccountService);
  protected transactions = inject(TransactionService);

  protected readonly TransactionType = TransactionType;

  transferForm = this.fb.group({
    sourceAccountId: ['', Validators.required],
    destinationAccountId: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(0.01)]],
    type: [TransactionType.STANDARD, Validators.required]
  });

  maxTransferAmount = computed(() => {
    const sourceAccountId = this.transferForm.get('sourceAccountId')?.value;
    if (!sourceAccountId) return 0;

    const account = this.accounts.accounts()
      .find(acc => acc.accountId.toString() === sourceAccountId);
    return account?.balance || 0;
  });

  submitTransfer() {
    if (this.transferForm.valid) {
      const formValue = this.transferForm.value;

      const request: TransactionRequest = {
        sourceAccountId: Number(formValue.sourceAccountId),
        destinationAccountId: Number(formValue.destinationAccountId),
        amount: Number(formValue.amount),
        type: formValue.type as TransactionType
      };

      this.transactions.createTransaction(request).subscribe({
        next: () => this.closeDialog(),
        error: () => console.error('Transaction failed')
      });
    }
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
