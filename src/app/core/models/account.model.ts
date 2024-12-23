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
