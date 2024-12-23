export interface Loan {
  loanId: number;
  principal: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  remainingAmount: number;
  status: LoanStatus;
  userId: number;
  userName: string;
  startDate: Date;
  endDate: Date;
  guarantees?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED'
}

export interface LoanRequest {
  principal: number;
  termMonths: number;
  guarantees?: string;
}
