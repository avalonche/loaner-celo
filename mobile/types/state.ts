export interface Wallet {
  address: string;
  phoneNumber: string;
  balance: string;
}

export interface User {
  wallet: Wallet;
  role: Role;
}

export interface Role {
  isBorrower: boolean;
  isManager: boolean;
}

export interface Loan {
  loanAddress: string;
  apy: string;
  term: string;
  amount: string;
  status: LoanStatus;
  internalStatus: InternalLoanStatus;
  borrower: string;
  pool: string;
  balance: string;
  start: string;
}

export enum LoanStatus {
  Void,
  Pending,
  Retracted,
  Running,
  Settled,
  Defaulted,
}

export enum InternalLoanStatus {
  Awaiting,
  Funded,
  Withdrawn,
  Settled,
  Defaulted,
}
