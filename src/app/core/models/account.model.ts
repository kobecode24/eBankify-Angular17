// core/models/account.model.ts
import {Transaction} from "./transaction.model";

export interface Account {
  accountId: number;
  balance: number;
  status: AccountStatus;
  userId: number;
  userName: string;
  transactions?: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED'
}

export interface AccountResponse {
  accountId: number;
  balance: number;
  status: AccountStatus;
  userId: number;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountCreationRequest {
  userId: number;
  initialDeposit: number;
}
