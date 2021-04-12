import { newKitFromWeb3 } from "@celo/contractkit";
import { StackScreenProps } from "@react-navigation/stack";
import { BigNumber } from "bignumber.js";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Provider } from "react-native-paper";
import Web3 from "web3";
import ContentCard from "../../../components/ContentCard";
import { ContainedButton, GradientView } from "../../../components/Themed";
import config from "../../../config";
import Colors from "../../../constants/Colors";
import GlobalStyles from "../../../constants/GlobalStyles";
import Layout from "../../../constants/Layout";
import { TabOneParamList } from "../../../types";
import { getPoolContract } from "../../../utils";
import { useUserContext } from "../../../context/userContext";
import { celoWalletRequest, Transaction } from "../../../utils/celoWallet";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function ManageFundsScreen({
  navigation,
  route,
}: StackScreenProps<TabOneParamList, "ManageFunds">) {

  const { wallet } = useUserContext();
  const [depositAmount, setDepositAmount] = useState("1");
  const [withdrawAmount, setWithdrawAmount] = useState("1");

  const depositPool = async (currencyAmount: uint256) => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const poolContract = getPoolContract(
      kit,
      config.poolAddress
    );
    const stableToken = await kit.contracts.getStableToken();
    const cUSDDecimals = await stableToken.decimals();
    const amountCUSD = new BigNumber(currencyAmount)
      .multipliedBy(new BigNumber(10).pow(cUSDDecimals))
      .toString();
    
    const depositTx: Transaction = {
      from: wallet.address,
      to: poolContract.options.address,
      gas: 13000000,
      txObject: poolContract.methods.flush(
        amountCUSD
      ),
    };
    const receipt = await celoWalletRequest([depositTx], "deposit moola", kit)
    console.log(receipt);
  }
  const withdrawPool = async (currencyAmount: uint256) => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const poolContract = getPoolContract(
      kit,
      config.poolAddress
    );
    const stableToken = await kit.contracts.getStableToken();
    const cUSDDecimals = await stableToken.decimals();
    const amountCUSD = new BigNumber(currencyAmount)
      .multipliedBy(new BigNumber(10).pow(cUSDDecimals))
      .toString();
    
    const withdrawTx: Transaction = {
      from: wallet.address,
      to: poolContract.options.address,
      gas: 13000000,
      txObject: poolContract.methods.pull(
        amountCUSD
      ),
    };
    const receipt = await celoWalletRequest([withdrawTx], "withdraw moola", kit)
    console.log(receipt);
  }
  return (
    <GradientView style={styles.container}>
      <Provider>
        <ScrollView style={styles.scrollContainer}>
          <ContentCard
            title={"Moola Markets"}
            content={
              "Earn interest by depositing idle funds into Moola Markets. You can withdraw at any time."
            }
            bottomAddon={
              <React.Fragment>
              <View style={styles.group}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.first,
                  depositAmount === "1" ? styles.active : null,
                ]}
                onPress={() => setDepositAmount("1")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    depositAmount === "1"
                      ? styles.activeText
                      : { color: Colors.dark.darkGrey },
                  ]}
                >
                  $1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, depositAmount === "5" ? styles.active : null]}
                onPress={() => setDepositAmount("5")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    depositAmount === "5"
                      ? styles.activeText
                      : { color: Colors.dark.darkGrey },
                  ]}
                >
                  $5
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, depositAmount === "10" ? styles.active : null]}
                onPress={() => setDepositAmount("10")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    depositAmount === "10"
                      ? styles.activeText
                      : { color: Colors.dark.darkGrey },
                  ]}
                >
                  $10
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.last,
                  depositAmount === "20" ? styles.active : null,
                ]}
                onPress={() => setDepositAmount("20")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    depositAmount === "20"
                      ? styles.activeText
                      : { color: Colors.dark.darkGrey },
                  ]}
                >
                  $20
                </Text>
              </TouchableOpacity>
              </View>
              <ContainedButton
                onPress={() => depositPool(depositAmount)} // should navigate to page
                text={"Deposit"}
                style={{marginBottom: 10}}
              />
              <View style={styles.group}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.first,
                  withdrawAmount === "1" ? styles.active : null,
                ]}
                onPress={() => setWithdrawAmount("1")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    depositAmount === "1"
                      ? styles.activeText
                      : { color: Colors.dark.darkGrey },
                  ]}
                >
                  $1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, withdrawAmount === "5" ? styles.active : null]}
                onPress={() => setWithdrawAmount("5")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    withdrawAmount === "5"
                      ? styles.activeText
                      : { color: Colors.dark.darkGrey },
                  ]}
                >
                  $5
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, withdrawAmount === "10" ? styles.active : null]}
                onPress={() => setWithdrawAmount("10")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    withdrawAmount === "10"
                      ? styles.activeText
                      : { color: Colors.dark.darkGrey },
                  ]}
                >
                  $10
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.last,
                  withdrawAmount === "20" ? styles.active : null,
                ]}
                onPress={() => setWithdrawAmount("20")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    withdrawAmount === "20"
                      ? styles.activeText
                      : { color: Colors.dark.darkGrey },
                  ]}
                >
                  $20
                </Text>
              </TouchableOpacity>
              </View>
              <ContainedButton
                onPress={() => withdrawPool(withdrawAmount)}
                text={"Withdraw"}
                style={{marginBottom: 10}}
              />
              </React.Fragment>
            }
          />
          <Text style={{ paddingVertical: 40 }} />
        </ScrollView>
      </Provider>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: Colors.light.tint,
  },
  activeText: {
    color: Colors.light.lightGray,
  },
  button: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "500",
    ...GlobalStyles.styles.secondaryHeader,
    color: Colors.light.background,
  },
  first: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  last: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  group: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    backgroundColor: "transparent",
    padding: 20,
    marginTop: GlobalStyles.consts.headerContainerHeight,
    width: Layout.window.width,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 10,
  },
  header: {
    color: Colors.light.background,
    paddingVertical: 10,
    ...GlobalStyles.styles.textHeader,
  },
  body: {
    textAlign: "center",
    color: Colors.light.background,
    ...GlobalStyles.styles.textPrimary,
  },
  shadow: {
    shadowColor: Colors.light.text,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    color: Colors.light.tint,
    ...GlobalStyles.styles.textHeader,
  },
  cardSubheader: {
    color: Colors.light.tint,
    letterSpacing: 0.6,
    fontSize: 20,
    ...GlobalStyles.styles.secondaryHeader,
  },
  cardBody: {
    paddingTop: 10,
    paddingHorizontal: 20,
    letterSpacing: 0.7,
    color: Colors.light.text,
    ...GlobalStyles.styles.textPrimary,
  },
  card: {
    borderRadius: GlobalStyles.consts.borderRadius,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  vLine: {
    backgroundColor: Colors.light.darkGrey,
    marginVertical: 10,
    width: 1,
  }
});

