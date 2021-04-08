import { newKitFromWeb3 } from "@celo/contractkit";
import { StackScreenProps } from "@react-navigation/stack";
import { BigNumber } from "bignumber.js";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput } from "react-native";
import Web3 from "web3";
import GlobalStyles from '../constants/GlobalStyles';
import { GradientView, OutlinedButton } from "../components/Themed";
import config from "../config";
import { useUserContext } from "../context/userContext";
import { TabThreeParamList } from "../types";
import { getLoanFactoryContract, toApy, toTerm } from "../utils";
import { celoWalletRequest, Transaction } from "../utils/celoWallet";

export default function RequestLoanScreen({
  navigation,
}: StackScreenProps<TabThreeParamList, "SubmitLoan">) {
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
        config.poolAddress,
        amountCUSD,
        toTerm(term),
        toApy(apy)
      ),
    };
    const receipts = await celoWalletRequest([createLoanTx], "createloan", kit);
    const loanAddress = receipts![0].logs[0].data;
    navigation.navigate("SubmitLoan", {
      loanAddress: '0x' + loanAddress.slice(loanAddress.length - 40, loanAddress.length),
    });
  };

  return (
    <GradientView style={styles.container}>
      <Text style={styles.labelText}>Community:</Text>
      <Text style={styles.labelText}>Interest Rate</Text>
      <TextInput
        style={styles.input}
        onChangeText={setApy}
        value={apy}
        keyboardType="numeric"
        placeholder={"Interest rate"}
      />
      <Text style={styles.labelText}>Loan Period (days)</Text>
      <TextInput
        style={styles.input}
        onChangeText={setTerm}
        value={term}
        keyboardType="numeric"
        placeholder={"Loan period (days)"}
      />
      <Text style={styles.labelText}>Loan Amount</Text>
      <TextInput
        style={styles.input}
        onChangeText={setAmount}
        value={amount}
        keyboardType="numeric"
        placeholder={"Loan Amount"}
      />
      <OutlinedButton
        text={"Create Loan"}
        onPress={() => createLoan(apy, term, amount)}
      />
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
  },

  numerText: {
    ...GlobalStyles.styles.secondaryHeader,
    fontSize: GlobalStyles.consts.headerFontSize,
  },
  labelText: {
    ...GlobalStyles.styles.textPrimary,
  },
  statsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  }
});
