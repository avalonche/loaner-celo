import { newKitFromWeb3 } from "@celo/contractkit";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { BigNumber } from "bignumber.js";
import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Surface, TouchableRipple } from "react-native-paper";
import Web3 from "web3";
import { GradientView } from "../../../components/Themed";
import config from "../../../config";
import Colors from "../../../constants/Colors";
import GlobalStyles from "../../../constants/GlobalStyles";
import Layout from "../../../constants/Layout";
import { useUserContext } from "../../../context/userContext";
import { TabOneParamList } from "../../../types";
import { getCommunityContract, getPoolContract } from "../../../utils";
import { celoWalletRequest, Transaction } from "../../../utils/celoWallet";

export default function StakeLoanScreen({
  route,
  navigation,
}: StackScreenProps<TabOneParamList, "StakeLoan">) {
  const { approved, amount, loanAddress } = route.params;
  const { wallet } = useUserContext();

  const [approvedFunds, setApprovedFunds] = useState(false);
  const [stakedFunds, setStakedFunds] = useState(false);

  const getKitAndContract = () => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const communityContract = getCommunityContract(
      kit,
      config.communityAddress
    );
    const poolContract = getPoolContract(kit, config.poolAddress);
    return { kit, communityContract, poolContract };
  };

  const approveFunds = async () => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const communityContract = getCommunityContract(
      kit,
      config.communityAddress
    );
    const stableToken = await kit.contracts.getStableToken();
    const txObject = stableToken.approve(
      communityContract.options.address,
      new BigNumber(amount).dividedBy(10).toString()
    ).txo;
    const approveTx: Transaction = {
      from: wallet.address,
      to: stableToken.address,
      txObject,
    };
    await celoWalletRequest([approveTx], "approve", kit);
    setApprovedFunds(true);
  };

  const approveLoan = async () => {
    const { kit, communityContract } = getKitAndContract();
    const stakeLoanTx: Transaction = {
      from: wallet.address,
      to: communityContract.options.address,
      txObject: communityContract.methods.approve(
        loanAddress,
        new BigNumber(amount).dividedBy(10).toString()
      ),
    };
    await celoWalletRequest([stakeLoanTx], "approveloan", kit);
    setStakedFunds(true);
  };

  const rejectLoan = async () => {
    const { kit, communityContract } = getKitAndContract();
    const stakeLoanTx: Transaction = {
      from: wallet.address,
      to: communityContract.options.address,
      txObject: communityContract.methods.reject(
        loanAddress,
        new BigNumber(amount).dividedBy(10).toString()
      ),
    };
    await celoWalletRequest([stakeLoanTx], "rejectloan", kit);
    setStakedFunds(true);
  };

  const fundLoan = async () => {
    const { kit, poolContract } = getKitAndContract();
    const fundLoanTx: Transaction = {
      from: wallet.address,
      to: poolContract.options.address,
      txObject: poolContract.methods.fund(loanAddress),
    };
    await celoWalletRequest([fundLoanTx], "fundloan", kit);
    setStakedFunds(false);
    setApprovedFunds(false);
    navigation.navigate("Staked", route.params);
  };
  
  return (
    <GradientView style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableRipple
          style={[styles.card, approvedFunds ? styles.disabled : null]}
          onPress={() => approveFunds()}
          disabled={approvedFunds}
        >
          <View>
            <View style={styles.cardHeader}>
              <Text style={GlobalStyles.styles.secondaryHeader}>
                {approved ? "Approve Stake" : "Reject Stake"}
              </Text>
              <MaterialCommunityIcons
                size={28}
                color={
                  approvedFunds ? Colors.light.placeholder : Colors.light.tint
                }
                name={
                  approvedFunds
                    ? "check-circle-outline"
                    : "numeric-1-circle-outline"
                }
              />
            </View>
            <View style={{ marginRight: 30 }}>
              <Text style={GlobalStyles.styles.textPrimary}>
                Approve the funds for you to stake for the borrower's loan.
              </Text>
            </View>
          </View>
        </TouchableRipple>
        <TouchableRipple
          style={[
            styles.card,
            !approvedFunds || stakedFunds ? styles.disabled : null,
          ]}
          onPress={() => (approved ? approveLoan() : rejectLoan())}
          disabled={!approvedFunds || stakedFunds}
        >
          <View>
            <View style={styles.cardHeader}>
              <Text style={GlobalStyles.styles.secondaryHeader}>
                Stake Fund
              </Text>
              <MaterialCommunityIcons
                size={28}
                color={
                  stakedFunds ? Colors.light.placeholder : Colors.light.tint
                }
                name={
                  stakedFunds
                    ? "check-circle-outline"
                    : "numeric-2-circle-outline"
                }
              />
            </View>
            <View style={{ marginRight: 30 }}>
              <Text style={GlobalStyles.styles.textPrimary}>
                Stake some funds for the borrower to vouch you loan decision.
                The stake will be returned after the loan term.
              </Text>
            </View>
          </View>
        </TouchableRipple>
        {approved ? (
          <TouchableRipple
            style={[
              styles.card,
              !approvedFunds || !stakedFunds ? styles.disabled : null,
            ]}
            disabled={!approvedFunds || !stakedFunds}
            onPress={() => fundLoan()}
          >
            <View>
              <View style={styles.cardHeader}>
                <Text style={GlobalStyles.styles.secondaryHeader}>
                  Fund Loan
                </Text>
                <MaterialCommunityIcons
                  size={28}
                  color={Colors.light.tint}
                  name={"numeric-3-circle-outline"}
                />
              </View>
              <View style={{ marginRight: 30 }}>
                <Text style={GlobalStyles.styles.textPrimary}>
                  Fund the loan from the community fund.
                </Text>
              </View>
            </View>
          </TouchableRipple>
        ) : null}
      </View>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  disabled: {
    backgroundColor: Colors.light.placeholder,
  },
  disabledText: {
    color: Colors.light.placeholder,
  },
  innerContainer: {
    width: Layout.window.width,
    paddingHorizontal: 20,
    marginTop: GlobalStyles.consts.headerContainerHeight,
  },
  card: {
    height: Layout.window.height / 5,
    padding: 20,
    marginBottom: 35,
    backgroundColor: Colors.light.background,
    borderRadius: GlobalStyles.consts.borderRadius,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  active: {
    borderWidth: 5,
    borderColor: Colors.light.tint,
  },
  header: {
    color: Colors.light.tint,
    ...GlobalStyles.styles.textHeader,
  },
});
