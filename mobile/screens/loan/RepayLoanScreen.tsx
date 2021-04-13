import { newKitFromWeb3 } from "@celo/contractkit";
import Slider from "@react-native-community/slider";
import { StackScreenProps } from "@react-navigation/stack";
import { BigNumber } from "bignumber.js";
import rgba from "hex-to-rgba";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Web3 from "web3";
import ContentCard from "../../components/ContentCard";
import { GradientView, OutlinedButton } from "../../components/Themed";
import config from "../../config";
import Colors from "../../constants/Colors";
import GlobalStyles from "../../constants/GlobalStyles";
import { useUserContext } from "../../context/userContext";
import { TabThreeParamList } from "../../types";
import { fromAmount, getLoanTokenContract } from "../../utils";
import { celoWalletRequest, Transaction } from "../../utils/celoWallet";


export default function RepayLoanScreen({
  route,
  navigation,
}: StackScreenProps<TabThreeParamList, "RepayLoan">) {
  const { loanAddress, debt } = route.params;
  const [amount, setAmount] = useState(Number(fromAmount(debt)));
  const [approvedFunds, setApprovedFunds] = useState(false);
  const { wallet } = useUserContext();

  const approve = async (amount: string) => {
    const repayAmount =
      amount === fromAmount(debt)
        ? debt
        : new BigNumber(amount)
            .multipliedBy(new BigNumber(10).pow(18))
            .toString();
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const loanTokenContract = getLoanTokenContract(kit, loanAddress);
    const stableToken = await kit.contracts.getStableToken();
    const txObject = stableToken.approve(
      loanTokenContract.options.address,
      repayAmount
    ).txo;
    const approveTx: Transaction = {
      from: wallet.address,
      to: stableToken.address,
      txObject,
    };
    await celoWalletRequest([approveTx], "approve", kit);
    setApprovedFunds(true);
  };

  const repayFunds = async (amount: string) => {
    const repayAmount =
      amount === fromAmount(debt)
        ? debt
        : new BigNumber(amount)
            .multipliedBy(new BigNumber(10).pow(18))
            .toString();
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const loanTokenContract = getLoanTokenContract(kit, loanAddress);
    const repayLoanTx: Transaction = {
      from: wallet.address,
      to: loanTokenContract.options.address,
      txObject: loanTokenContract.methods.repay(wallet.address, repayAmount),
    };
    await celoWalletRequest([repayLoanTx], "repayloan", kit);
    setApprovedFunds(false);
    navigation.navigate("Submitted");
  };

  return (
    <GradientView style={styles.container}>
      <View
        style={{
          marginTop: GlobalStyles.consts.headerContainerHeight / 2,
        }}
      >
        <Text style={styles.header}>Repay Amount</Text>
        <Text style={styles.labelText}>
          Specify the amount you wish to repay
        </Text>
        <View style={{ alignContent: "center", justifyContent: "center" }}>
          <ContentCard style={{ alignItems: "center" }} title={`$${amount}`} />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 20,
          }}
        >
          <Text style={styles.description}>$0</Text>
          <Slider
            style={{ flex: 1 }}
            minimumValue={0}
            maximumValue={Number(fromAmount(debt))}
            minimumTrackTintColor={rgba("#CC66FF", `${0.5}`)}
            maximumTrackTintColor={rgba(Colors.light.darkGrey, `${0.5}`)}
            thumbTintColor={"#CC66FF"}
            value={amount}
            onValueChange={setAmount}
            step={0.01}
            disabled={approvedFunds}
          />
          <Text style={styles.description}>${fromAmount(debt)}</Text>
        </View>

        <OutlinedButton
          text={"Approve Repayment"}
          style={{ marginTop: 20 }}
          onPress={() => approve(amount.toString())}
          disabled={approvedFunds}
        />
        <OutlinedButton
          text={"Repay Loan"}
          style={{ marginTop: 20 }}
          disabled={!approvedFunds}
          onPress={() => repayFunds(amount.toString())}
        />
      </View>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
    padding: 20,
  },
  header: {
    color: Colors.light.background,
    marginBottom: 10,
    ...GlobalStyles.styles.textHeader,
  },
  description: {
    color: Colors.light.background,
    ...GlobalStyles.styles.secondaryHeader,
  },
  labelText: {
    color: Colors.light.lightGray,
    ...GlobalStyles.styles.textPrimary,
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 16,
    borderColor: "white",
    borderWidth: 3,
    backgroundColor: "green",
  },
});
