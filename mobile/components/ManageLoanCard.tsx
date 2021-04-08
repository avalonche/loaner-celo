import { BigNumber } from "bignumber.js";
import React from 'react';
import { Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Loan } from "../types/state";
import { fromApy, fromTerm, getCommunityContract, getLoanTokenContract, getPoolContract } from "../utils";
import Web3 from 'web3';
import config from "../config";
import { newKitFromWeb3 } from "@celo/contractkit";
import { useUserContext } from "../context/userContext";
import { celoWalletRequest, Transaction } from "../utils/celoWallet";
import { OutlinedButton } from "./Themed";

export default function LoanCard(props: Loan) {
  const { apy, term, amount, borrower, loanAddress, status, internalStatus } = props;
  const { wallet } = useUserContext();
  
  const setUpVote = async () => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const communityContract = getCommunityContract(kit, config.communityAddress);
    const stableToken = await kit.contracts.getStableToken();
    const txObject = stableToken.approve(
        communityContract.options.address,
        amount,
    ).txo;
    const approveTx: Transaction = {
        from: wallet.address,
        to: stableToken.address,
        txObject,
    }
    return { kit, approveTx, communityContract }
  }
  
  const approveLoan = async () => {
    const { kit, approveTx, communityContract } = await setUpVote()
    console.log()
    const approveLoanTx: Transaction = {
      from: wallet.address,
      to: communityContract.options.address,
      txObject: communityContract.methods.approve(loanAddress, new BigNumber(amount).dividedBy(10).toString()),
    }

    const loanPoolContract = getPoolContract(kit, config.poolAddress);
    const loanContract = getLoanTokenContract(kit, loanAddress)
    const fundLoanTx: Transaction = {
      from: wallet.address,
      to: loanPoolContract.options.address,
      txObject: loanPoolContract.methods.fund(loanAddress),
    }
    console.log(loanAddress)
    // await celoWalletRequest(
    //   [approveTx],
    //   'stake',
    //   kit
    // );
    await celoWalletRequest(
      [approveLoanTx],
      'approveloan',
      kit,
    );
    await celoWalletRequest(
      [fundLoanTx],
      'fundloan',
      kit,
    )
  }

  const rejectLoan = async () => {
    const { kit, approveTx, communityContract } = await setUpVote()

    const rejectLoanTx: Transaction = {
      from: wallet.address,
      to: communityContract.options.address,
      txObject: communityContract.methods.reject(loanAddress, new BigNumber(amount).dividedBy(10).toString())
    }
    await celoWalletRequest(
      [approveTx, rejectLoanTx],
      'rejectTx',
      kit
    );
  }

  return (
    <>
      <Text>Interest Rate: {fromApy(apy)}%</Text>
      <Text>Loan Duration: {fromTerm(term)} days</Text>
      <Text>
        Loan Amount: ${new BigNumber(amount).dividedBy(new BigNumber(10).pow(18)).toString()}
      </Text>
      <Text>Borrower Address: {borrower}</Text>
      <OutlinedButton onPress={approveLoan} text={"Approve"}/>
      <OutlinedButton onPress={rejectLoan} text={"Reject"}/>
    </>
  );
}
