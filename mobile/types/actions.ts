import { RESET_USER_INFO, SET_USER_BALANCE, SET_USER_CELO_WALLET_INFO } from "../constants";
import { Wallet } from "./state";

interface UserWalletAction {
    type: typeof SET_USER_CELO_WALLET_INFO,
    payload: Wallet,
}

interface UserBalanceAction {
    type: typeof SET_USER_BALANCE,
    payload: string,
}

interface ResetUserAction {
    type: typeof RESET_USER_INFO,
    payload: unknown,
}

export type UserActions =
    | UserWalletAction
    | UserBalanceAction
    | ResetUserAction;