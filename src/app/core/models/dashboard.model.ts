// core/models/dashboard.model.ts
import {Transaction} from "./transaction.model";

export interface DashboardStats {
  totalAccounts: number;
  totalTransactions: number;
  totalActiveLoans: number;
  pendingApprovals: number;
  recentTransactions: Transaction[];
  accountBalances: AccountBalance[];
}

export interface AccountBalance {
  accountId: number;
  balance: number;
  accountType: string;
}
