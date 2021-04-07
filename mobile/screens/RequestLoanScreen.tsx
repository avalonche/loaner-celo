import { newKitFromWeb3 } from "@celo/contractkit";
import { StackScreenProps } from "@react-navigation/stack";
import { BigNumber } from "bignumber.js";
import React, { useState } from "react";
import { SafeAreaView, TextInput } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Web3 from "web3";
import config from "../config";
import { useUserContext } from "../context/userContext";
import { TabThreeParamList } from "../types";
import { getLoanFactoryContract, toApy, toTerm } from "../utils";
import { celoWalletRequest, Transaction } from "../utils/celoWallet";

export default function RequestLoanScreen({ navigation }: StackScreenProps<TabThreeParamList, 'SubmitLoan'>) {
  // community settings to quote interest rate
  const [apy, setApy] = useState("10");
  const [term, setTerm] = useState("");
  const [amount, setAmount] = useState("");

  const { wallet } = useUserContext();

  const createLoan = async (apy: string, term: string, amount: string) => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const loanFactoryContract = getLoanFactoryContract(
      kit,
      config.loanFactoryAddress
    );
    const stableToken = await kit.contracts.getStableToken();
    const cUSDDecimals = await stableToken.decimals();
    const amountCUSD = new BigNumber(amount)
      .multipliedBy(new BigNumber(10).pow(cUSDDecimals))
      .toString();
    const createLoanTx: Transaction = {
      from: wallet.address,
      to: loanFactoryContract.options.address,
      txObject: loanFactoryContract.methods.createLoanToken(
        config.communityAddress,
        amountCUSD,
        toTerm(term),
        toApy(apy),
      ),
    };
    const receipts = await celoWalletRequest([createLoanTx], 'createloan', kit);
    navigation.navigate('SubmitLoan', { loanAddress: receipts![0].events!.LoanTokenCreated.returnValues.contractAddress});
  };

  return (
    <SafeAreaView>
        <TouchableOpacity>
            Community: 
        </TouchableOpacity>
      <TextInput onChangeText={setApy} value={apy} keyboardType="numeric" />
      <TextInput onChangeText={setTerm} value={term} keyboardType="numeric" />
      <TextInput
        onChangeText={setAmount}
        value={amount}
        keyboardType="numeric"
      />
      <TouchableOpacity onPress={() => createLoan(apy, term, amount)}>Create Loan</TouchableOpacity>
    </SafeAreaView>
  );
}
