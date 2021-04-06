import { RESET_USER_INFO, SET_BORROWER, SET_MANAGER, SET_USER_BALANCE, SET_USER_CELO_WALLET_INFO } from "../constants";
import { Wallet } from "./state";

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
