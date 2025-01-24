import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { CartTransaction } from '../../../core/models/cart-transaction.model';
import { TransactionType } from '../../../core/models/transaction.model';
import { UserService } from '../../../core/services/user.service';
import {Observable, of} from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AccountResponse } from '../../../core/models/account.model';

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{ isEdit ? 'Edit' : 'Add' }} Transaction</h2>

      <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill">
          <mat-label>Transaction Type</mat-label>
          <mat-select formControlName="type">
            <mat-option [value]="TransactionType.STANDARD">Standard</mat-option>
            <mat-option [value]="TransactionType.INSTANT">Instant</mat-option>
          </mat-select>
          @if (transactionForm.get('type')?.hasError('required')) {
            <mat-error>Transaction type is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount">
          @if (transactionForm.get('amount')?.hasError('required')) {
            <mat-error>Amount is required</mat-error>
          }
          @if (transactionForm.get('amount')?.hasError('min')) {
            <mat-error>Amount must be greater than 0</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Source Account</mat-label>
          <input type="text"
                 matInput
                 formControlName="sourceAccountSearch"
                 [matAutocomplete]="sourceAuto">
          <mat-autocomplete #sourceAuto="matAutocomplete"
                          [displayWith]="displayFn"
                          (optionSelected)="onSourceSelected($event)">
            @for (account of sourceAccounts$ | async; track account.accountId) {
              <mat-option [value]="account">
                {{account.userName}} - Account #{{account.accountId}}
              </mat-option>
            }
          </mat-autocomplete>
          @if (transactionForm.get('sourceAccountId')?.hasError('required')) {
            <mat-error>Source account is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Destination Account</mat-label>
          <input type="text"
                 matInput
                 formControlName="destinationAccountSearch"
                 [matAutocomplete]="destAuto">
          <mat-autocomplete #destAuto="matAutocomplete"
                          [displayWith]="displayFn"
                          (optionSelected)="onDestinationSelected($event)">
            @for (account of destinationAccounts$ | async; track account.accountId) {
              <mat-option [value]="account">
                {{account.userName}} - Account #{{account.accountId}}
              </mat-option>
            }
          </mat-autocomplete>
          @if (transactionForm.get('destinationAccountId')?.hasError('required')) {
            <mat-error>Destination account is required</mat-error>
          }
        </mat-form-field>

        <div class="dialog-actions">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit"
                  [disabled]="!transactionForm.valid">
            {{ isEdit ? 'Update' : 'Add' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
      min-width: 400px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class TransactionDialogComponent implements OnInit {
  transactionForm: FormGroup = this.fb.group({
    type: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(0.01)]],
    sourceAccountSearch: [''],
    destinationAccountSearch: [''],
    sourceAccountId: ['', Validators.required],
    destinationAccountId: ['', Validators.required]
  });
  isEdit: boolean;

  // Initialize the Observables with empty arrays
  sourceAccounts$: Observable<AccountResponse[]> = of([]);
  destinationAccounts$: Observable<AccountResponse[]> = of([]);

  protected readonly TransactionType = TransactionType;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { transaction?: CartTransaction },
    private userService: UserService
  ) {
    this.isEdit = !!data.transaction;
    this.initForm();
  }

  ngOnInit() {
    this.initializeAccountSearches();
  }

  private initializeAccountSearches() {
    this.sourceAccounts$ = this.transactionForm.get('sourceAccountSearch')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.userService.searchAccounts(typeof value === 'string' ? value : ''))
    );

    this.destinationAccounts$ = this.transactionForm.get('destinationAccountSearch')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.userService.searchAccounts(typeof value === 'string' ? value : ''))
    );
  }

  private initForm(): void {
    if (this.isEdit) {
      this.transactionForm.patchValue({
        type: this.data.transaction?.type,
        amount: this.data.transaction?.amount,
        sourceAccountId: this.data.transaction?.sourceAccountId,
        destinationAccountId: this.data.transaction?.destinationAccountId
      });
    }
  }

  displayFn(account: AccountResponse): string {
    return account ? `${account.userName} - Account #${account.accountId}` : '';
  }

  onSourceSelected(event: any): void {
    this.transactionForm.patchValue({
      sourceAccountId: event.option.value.accountId
    });
  }

  onDestinationSelected(event: any): void {
    this.transactionForm.patchValue({
      destinationAccountId: event.option.value.accountId
    });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      const transaction: Partial<CartTransaction> = {
        type: formValue.type,
        amount: formValue.amount,
        sourceAccountId: formValue.sourceAccountId,
        destinationAccountId: formValue.destinationAccountId,
        updatedAt: new Date()
      };

      if (!this.isEdit) {
        transaction.id = crypto.randomUUID();
        transaction.createdAt = new Date();
      }

      this.dialogRef.close(transaction);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
