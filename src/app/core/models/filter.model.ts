// core/models/filter.model.ts
import {TransactionStatus, TransactionType} from "./transaction.model";
import {AccountStatus} from "./account.model";

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

export interface TransactionFilter extends DateRangeFilter {
  type?: TransactionType;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
  accountId?: number;
}

export interface AccountFilter {
  status?: AccountStatus;
  minBalance?: number;
  maxBalance?: number;
  userId?: number;
}
