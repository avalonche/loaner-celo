import { APPEND_LOAN, CLEAR_LOANS, RESET_USER_INFO, SET_BORROWER, SET_LOANS, SET_MANAGER, SET_USER_BALANCE, SET_USER_CELO_WALLET_INFO } from "../constants";
import { Loan, Wallet } from "./state";

interface UserWalletAction {
    type: typeof SET_USER_CELO_WALLET_INFO,
    payload: Wallet,
}

interface UserBalanceAction {
    type: typeof SET_USER_BALANCE,
    payload: string,
}

interface UserManagerAction {
    type: typeof SET_MANAGER,
    payload: boolean,
}

interface UserBorrowerAction {
    type: typeof SET_BORROWER,
    payload: boolean,
}

interface ResetUserAction {
    type: typeof RESET_USER_INFO,
    payload: unknown,
}

export type UserActions =
    | UserWalletAction
    | UserBalanceAction
    | UserManagerAction
    | UserBorrowerAction
    | ResetUserAction;

interface SetLoansAction {
    type: typeof SET_LOANS,
    payload: Loan[],
}

interface AppendLoanAction {
    type: typeof APPEND_LOAN,
    payload: Loan,
}

interface ClearLoansAction {
    type: typeof CLEAR_LOANS;
    payload: unknown;
}
export type LoanActions =
    | SetLoansAction
    | AppendLoanAction
    | ClearLoansAction;