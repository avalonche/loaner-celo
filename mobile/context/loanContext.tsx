import React, { createContext, Dispatch, useContext, useMemo, useReducer } from "react";
import { APPEND_LOAN, CLEAR_LOANS, SET_LOANS } from "../constants";
import { LoanActions } from "../types/actions";
import { Loan } from "../types/state";

const INITIAL_LOAN_STATE: Loan[] = []

export const LoanContext = createContext<{
  state: Loan[],
  dispatch: Dispatch<LoanActions>
}>({
  state: INITIAL_LOAN_STATE,
  dispatch: () => null,
});

const loanReducer = (state = INITIAL_LOAN_STATE, action: LoanActions) => {
  switch(action.type) {
    case SET_LOANS:
        return action.payload
    case APPEND_LOAN:
        return [...state, action.payload];
    case CLEAR_LOANS:
        return INITIAL_LOAN_STATE;
  }
};

export const LoanProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(loanReducer, INITIAL_LOAN_STATE);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  
  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error("useLoanContext must be used inside a LoanProvider");
  }

  const { state, dispatch } = context;

  const setLoans = (loans: Loan[]) => {
      dispatch({ type: SET_LOANS, payload: loans });
  }

  const appendLoan = (loan: Loan) => {
      dispatch({ type: APPEND_LOAN, payload: loan });
  }

  const clearLoans = () => {
      dispatch({ type: CLEAR_LOANS, payload: undefined });
  }

  return { loans: state, setLoans, appendLoan, clearLoans };
}