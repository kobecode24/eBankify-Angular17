// src/app/core/models/cart-transaction.model.ts
import { TransactionType } from './transaction.model';

export interface CartTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  sourceAccountId: number;
  destinationAccountId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartState {
  transactions: CartTransaction[];
  loading: boolean;
  error: string | null;
  maxTransactions: number;
}
