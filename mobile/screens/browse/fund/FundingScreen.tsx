import { newKitFromWeb3 } from "@celo/contractkit";
import { AntDesign } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { BigNumber } from "bignumber.js";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Web3 from "web3";
import { GradientView, OutlinedButton } from "../../../components/Themed";
import config from "../../../config";
import Colors from "../../../constants/Colors";
import GlobalStyles from "../../../constants/GlobalStyles";
import { useUserContext } from "../../../context/userContext";
import { TabOneParamList } from "../../../types";
import { getPoolContract } from "../../../utils";
import { celoWalletRequest, Transaction } from "../../../utils/celoWallet";

export default function FundingScreen({
  navigation,
  route,
}: StackScreenProps<TabOneParamList, "Fund">) {
  const { wallet } = useUserContext();
  const { name } = route.params;
  const [amount, setAmount] = useState("1");
  const [approved, setApproved] = useState(false);

  const approveFunds = async (fundAmount: number) => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const stableToken = await kit.contracts.getStableToken();
    const cUSDDecimals = await stableToken.decimals();
    const amountCUSD = new BigNumber(fundAmount)
      .multipliedBy(new BigNumber(10).pow(cUSDDecimals))
      .toString();
    const txObject = stableToken.approve(config.poolAddress, amountCUSD).txo;
    const approveTx: Transaction = {
      from: wallet.address,
      to: stableToken.address,
      txObject,
    };
    await celoWalletRequest([approveTx], "approvefund", kit);
    setApproved(true);
  };

  const fundCommunity = async (fundAmount: number) => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const poolContract = getPoolContract(kit, config.poolAddress);
    const stableToken = await kit.contracts.getStableToken();
    const cUSDDecimals = await stableToken.decimals();
    const amountCUSD = new BigNumber(fundAmount)
      .multipliedBy(new BigNumber(10).pow(cUSDDecimals))
      .toString();
    const fundTx: Transaction = {
      from: wallet.address,
      to: poolContract.options.address,
      txObject: await poolContract.methods.join(amountCUSD),
    };

    await celoWalletRequest([fundTx], "fundpool", kit);
    setAmount("1");
    navigation.navigate("Funded", { amount: fundAmount, ...route.params });
  };

  return (
    <GradientView style={styles.container}>
      <View>
        <View>
          <Text style={[styles.header, GlobalStyles.styles.textHeader]}>
            {name}
          </Text>
        </View>
        <View>
          <Text style={[styles.header, GlobalStyles.styles.secondaryHeader]}>
            Amount
          </Text>
        </View>
        <View style={styles.group}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.first,
              amount === "1" ? styles.active : null,
            ]}
            onPress={() => setAmount("1")}
          >
            <Text
              style={[
                styles.buttonText,
                amount === "1"
                  ? styles.activeText
                  : { color: Colors.light.lightGray },
              ]}
            >
              $1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, amount === "5" ? styles.active : null]}
            onPress={() => setAmount("5")}
          >
            <Text
              style={[
                styles.buttonText,
                amount === "5"
                  ? styles.activeText
                  : { color: Colors.light.lightGray },
              ]}
            >
              $5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, amount === "10" ? styles.active : null]}
            onPress={() => setAmount("10")}
          >
            <Text
              style={[
                styles.buttonText,
                amount === "10"
                  ? styles.activeText
                  : { color: Colors.light.lightGray },
              ]}
            >
              $10
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.last,
              amount === "Custom" ? styles.active : null,
            ]}
            onPress={() => setAmount("Custom")}
          >
            <Text
              style={[
                styles.buttonText,
                amount === "Custom"
                  ? styles.activeText
                  : { color: Colors.light.lightGray },
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {approved ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 30,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: Colors.light.lightGray,
              }}
            />
            <View style={{ alignItems: "center" }}>
              <AntDesign
                name="checkcircleo"
                size={30}
                color={Colors.light.lightGray}
                style={{ padding: 10 }}
              />
              <Text
                style={[styles.buttonText, GlobalStyles.styles.textPrimary]}
              >
                Approved
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: Colors.light.lightGray,
              }}
            />
          </View>
          <OutlinedButton
            onPress={() => fundCommunity(Number(amount))}
            text={"Fund Community"}
            style={{ marginVertical: 20 }}
          />
        </>
      ) : (
        <OutlinedButton
          onPress={() => approveFunds(Number(amount))}
          text={"Approve Funds"}
          style={{ marginVertical: 20 }}
        />
      )}
    </GradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    padding: 20,
  },
  name: {
    color: Colors.light.background,
    textAlign: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
  },
  header: {
    color: Colors.light.background,
    paddingVertical: 14,
  },
  section: {
    flexDirection: "column",
    marginHorizontal: 14,
    marginBottom: 14,
    paddingBottom: 24,
    // borderBottomColor: "#e1e8ee",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    marginVertical: 14,
  },
  group: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 28,
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
  active: {
    backgroundColor: Colors.light.tint,
  },
  activeText: {
    color: Colors.light.lightGray,
  },
  first: {
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
  },
  last: {
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
  },
  option: {
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
