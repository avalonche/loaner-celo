import { newKitFromWeb3 } from "@celo/contractkit";
import { StackScreenProps } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Web3 from "web3";
import { GradientView, OutlinedButton } from "../components/Themed";
import config from "../config";
import { useLoanContext } from "../context/loanContext";
import { useUserContext } from "../context/userContext";
import { TabThreeParamList } from "../types";
import { InternalLoanStatus, Loan, LoanStatus } from "../types/state";
import {
  getCommunityContract,
  getLoanFactoryContract,
  getLoanTokenContract,
  getPoolContract,
} from "../utils";
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
      const communityContract = getCommunityContract(
        kit,
        config.communityAddress
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
          const loanTokenContract = getLoanTokenContract(
            kit,
            returnValues.contractAddress
          );
          const apy = await loanTokenContract.methods.apy().call();
          const term = await loanTokenContract.methods.term().call();
          const amount = await loanTokenContract.methods.amount().call();
          const borrower: string = await loanTokenContract.methods
            .borrower()
            .call();
          const status: string = await communityContract.methods
            .status(loanTokenContract.options.address)
            .call();
          const internalStatus: string = await loanTokenContract.methods
            .status()
            .call();
          return {
            loanAddress: loanTokenContract.options.address,
            apy: new BigNumber(apy).toString(),
            term: new BigNumber(term).toString(),
            amount: new BigNumber(amount).toString(),
            borrower: borrower,
            internalStatus: Number(internalStatus),
            status: Number(status),
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

    const loanPoolContract = getPoolContract(kit, config.poolAddress);
    const fundLoanTx: Transaction = {
      from: wallet.address,
      to: loanPoolContract.options.address,
      txObject: loanPoolContract.methods.fund(loanAddress),
    };
    // await celoWalletRequest(
    //   [fundLoanTx],
    //   'fundloan',
    //   kit
    // );
    const loanContract = getLoanTokenContract(kit, loanAddress);
    const withdrawTx: Transaction = {
      from: wallet.address,
      to: loanContract.options.address,
      txObject: loanContract.methods.withdraw(wallet.address),
    };
    await celoWalletRequest([withdrawTx], "withdrawloan", kit);
  };

  const repayFunds = async (loanAddress: string) => {};

  const ApprovedLoanList = loans
    .filter(
      ({ borrower, internalStatus }) =>
        wallet.address !== borrower &&
        internalStatus === InternalLoanStatus.Funded
    )
    .map((loan, index) => {
      return (
        <>
          <Text>{loan.loanAddress}</Text>
          <OutlinedButton
            text={"Withdraw Funds"}
            onPress={() => withdrawFunds(loan.loanAddress)}
          />
        </>
      );
    });

  const RepayLoanList = loans
    .filter(
      ({ borrower, internalStatus }) =>
        wallet.address !== borrower &&
        internalStatus == InternalLoanStatus.Withdrawn
    )
    .map((loan, index) => {
      return (
        <>
          <Text>{loan.loanAddress}</Text>
          <OutlinedButton
            text={"Repay Loan"}
            onPress={() => repayFunds(loan.loanAddress)}
          />
        </>
      );
    });

  return (
    <GradientView style={styles.container}>
      <OutlinedButton
        onPress={() => navigation.navigate("RequestLoan")}
        text={"Request a Loan"}
      />
      <Text>Your Loans</Text>
      <Text>Approved</Text>
      {ApprovedLoanList}
      <Text>To repay</Text>
      {RepayLoanList}
    </GradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    padding: 20,
  },
});
