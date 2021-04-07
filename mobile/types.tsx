import { ImageSourcePropType } from "react-native";

export type SubmitLoanParamList = {
  loanAddress: string,
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
  Fund: undefined;
};

export type TabTwoParamList = {
  Profile: undefined;
  ManageCommunity: undefined;
  AddBorrower: undefined;
  ManageLoans: undefined;
};

export type TabThreeParamList = {
  UserLoans: undefined;
  RequestLoan: undefined;
  SubmitLoan: SubmitLoanParamList;
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
