// core/models/transaction.model.ts
export interface Transaction {
  transactionId: number;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  sourceAccountId: number;
  destinationAccountId: number;
  fee: number;
  createdAt: Date;
}

export enum TransactionType {
  STANDARD = 'STANDARD',
  INSTANT = 'INSTANT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export interface TransactionRequest {
  amount: number;
  type: TransactionType;
  sourceAccountId: number;
  destinationAccountId: number;
}


export interface TransactionResponse {
  transactionId: number;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  sourceAccountId: number;
  destinationAccountId: number;
  createdAt: Date;
}

export interface TransactionRequest {
  amount: number;
  sourceAccountId: number;
  destinationAccountId: number;
  type: TransactionType;
}
