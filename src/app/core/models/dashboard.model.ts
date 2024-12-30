// core/models/dashboard.model.ts
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
  totalTransactions: number;
  lastUpdated: Date;
}

export interface CustomerStats {
  activeCustomers: number;
  totalAccounts: number;
  pendingApplications: number;
  supportTickets: number;
}

export interface AccountSummary {
  accountId: string;
  accountType: string;
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
  lastTransaction?: Date;
}

export interface SupportTicket {
  ticketId: string;
  customerId: string;
  customerName: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}
