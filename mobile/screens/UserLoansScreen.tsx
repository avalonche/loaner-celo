import { newKitFromWeb3 } from "@celo/contractkit";
import { StackScreenProps } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import { useEffect } from "react";
import { Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Web3 from "web3";
import config from "../config";
import { useLoanContext } from "../context/loanContext";
import { useUserContext } from "../context/userContext";
import { TabThreeParamList } from "../types";
import { Loan, LoanStatus } from "../types/state";
import { getLoanFactoryContract, getLoanTokenContract } from "../utils";
import { celoWalletRequest, Transaction } from "../utils/celoWallet";

export default function UserLoansScreen({
  navigation,
}: StackScreenProps<TabThreeParamList, "RequestLoan">) {
  const { loans, setLoans } = useLoanContext();
  const { wallet } = useUserContext();

  useEffect(() => {
    const getLoans = async () => {
      const web3 = new Web3(config.jsonRpc);
      const kit = newKitFromWeb3(web3);
      const loanFactoryContract = getLoanFactoryContract(
        kit,
        config.loanFactoryAddress
      );
      const events = await loanFactoryContract.getPastEvents(
        "LoanTokenCreated",
        {
          fromBlock: 0,
          toBlock: "latest",
        }
      );
      const fetchedLoans: Loan[] = await Promise.all(
        events.map(async ({ returnValues }) => {
          const loanTokenContract = getLoanFactoryContract(
            kit,
            returnValues.contractAddress
          );
          const apy = await loanTokenContract.methods.apy().call();
          const term = await loanFactoryContract.methods.term().call();
          const amount = await loanFactoryContract.methods.amount().call();
          const borrower: string = await loanFactoryContract.methods
            .amount()
            .call();
          const status: LoanStatus = await loanFactoryContract.methods
            .status()
            .call();
          return {
            loanAddress: loanTokenContract.options.address,
            apy: new BigNumber(apy).toString(),
            term: new BigNumber(term).toString(),
            amount: new BigNumber(amount).toString(),
            borrower: borrower,
            status,
          };
        })
      );
      setLoans(fetchedLoans);
    };
    getLoans();
  }, []);

  const withdrawFunds = async (loanAddress: string) => {
      const web3 = new Web3(config.jsonRpc);
      const kit = newKitFromWeb3(web3);
      const loanContract = getLoanTokenContract(kit, loanAddress);
      const withdrawTx: Transaction = {
          from: wallet.address,
          to: loanContract.options.address,
          txObject: loanContract.methods.withdraw(wallet.address),
      }
      await celoWalletRequest(
          [withdrawTx],
          'withdrawloan',
          kit
      );
  };

  const ApprovedLoanList = loans
    .filter(
      ({ borrower, status }) =>
        wallet.address == borrower && status == LoanStatus.Funded
    )
    .map((loan, index) => {
      return (
        <>
          <Text>{loan.loanAddress}</Text>
          <TouchableOpacity onPress={() => withdrawFunds(loan.loanAddress)}>
            Withdraw Funds
          </TouchableOpacity>
        </>
      );
    });

  const RepayLoanList = loans
    .filter(
      ({ borrower, status }) =>
        wallet.address == borrower && status == LoanStatus.Withdrawn
    )
    .map((loan, index) => {
      return (
        <>
          <Text>{loan.loanAddress}</Text>
          <TouchableOpacity>Repay Loan</TouchableOpacity>
        </>
      );
    });

  return (
    <>
      <TouchableOpacity onPress={() => navigation.navigate("RequestLoan")}>
        Request Loan
      </TouchableOpacity>
      <Text>Your Loans</Text>
      <Text>Approved</Text>
      {ApprovedLoanList}
      <Text>To repay</Text>
      {RepayLoanList}
    </>
  );
}
