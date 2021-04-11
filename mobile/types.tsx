import { ImageSourcePropType } from "react-native";

export type SubmitLoanParamList = {
  loanAddress: string,
  amount: string,
  term: string,
  apy: string,
}

export type RootStackParamList = {
  Root: undefined;
  Landing: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  Browse: undefined;
  Profile: undefined;
  Loans: undefined;
  Settings: undefined;
  Home: undefined;
};

export type TabOneParamList = {
  Browse: undefined;
  Community: CommunitySummary;
  Fund: CommunitySummary;
  Funded: CommunitySummary & FundSummary;
  AddContact: CommunitySummary;
  Added: CommunitySummary & ContactSummary;
  ManageLoans: CommunitySummary;
  StakeLoan: StakeLoanParamList & CommunitySummary;
  Staked: CommunitySummary;
};

export type TabTwoParamList = {
  Profile: undefined;
};

export type TabThreeParamList = {
  UserLoans: undefined;
  RequestLoan: undefined;
  SubmitLoan: SubmitLoanParamList;
  Submitted: undefined;
  RepayLoan: RepayLoanParamList;
  Repaid: undefined;
};

export type TabFourParamList = {
  Settings: undefined;
};

export type CommunitySummary = {
  name: string,
  logo: ImageSourcePropType,
  image: ImageSourcePropType,
  description: string,
  funders: number,
  loansMade: number,
  totalValueLocked: number,
}

export type ContactSummary = {
  contact: string,
  phone: string,
  address: string,
}

export type FundSummary = {
  amount: number,
}

export type StakeLoanParamList = {
  approved: boolean;
  loanAddress: string;
  amount: string;
}

export type RepayLoanParamList = {
  loanAddress: string;
  debt: string;
}
