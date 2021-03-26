import React, { createContext, Dispatch, useContext, useMemo, useReducer, useState } from "react";
import { RESET_USER_INFO, SET_USER_BALANCE, SET_USER_CELO_WALLET_INFO } from "../constants";
import { UserActions } from "../types/actions";
import { Role, User, Wallet } from "../types/state";

const INITIAL_USER_STATE: User = {
    wallet: {
        address: '',
        phoneNumber: '',
        balance: '',
    },
    role: {
        isBorrower: false,
        isManager: false,
    }
}

export const UserContext = createContext<{
  state: User,
  dispatch: Dispatch<UserActions>
}>({
  state: INITIAL_USER_STATE,
  dispatch: () => null,
});

const userReducer = (state = INITIAL_USER_STATE, action: UserActions) => {
  switch(action.type) {
    case RESET_USER_INFO:
      return INITIAL_USER_STATE;
    case SET_USER_CELO_WALLET_INFO:
      return {...state, wallet: action.payload}
    case SET_USER_BALANCE:
      const wallet = {...state.wallet, balance: action.payload}
      return {...state, wallet}
  }
};

export const UserProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, INITIAL_USER_STATE);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used inside a UserProvider");
  }

  const { state, dispatch } = context;
  const { wallet, role } = state;

  const setUserWallet = (wallet: Wallet) => {
    dispatch({ type: SET_USER_CELO_WALLET_INFO, payload: wallet });
  };
  const setUserBalance = (balance: string) => {
    dispatch({ type: SET_USER_BALANCE, payload: balance });
  }

  const clearUser = () => {
    dispatch({ type: RESET_USER_INFO, payload: undefined });
  }

  return { wallet, role, setUserWallet, setUserBalance, clearUser };
}