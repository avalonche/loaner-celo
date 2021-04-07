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
  borrower: string;
}

export enum LoanStatus {
  Awaiting,
  Funded,
  Withdrawn,
  Settled,
  Defaulted,
}
