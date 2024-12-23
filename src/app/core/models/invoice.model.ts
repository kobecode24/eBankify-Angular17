// core/models/invoice.model.ts
export interface Invoice {
  invoiceId: number;
  amountDue: number;
  dueDate: Date;
  status: InvoiceStatus;
  userId: number;
  userName: string;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}
