import { newKitFromWeb3 } from "@celo/contractkit";
import { StackScreenProps } from "@react-navigation/stack";
import React, { useState } from "react";
import Web3 from "web3";
import config from "../../config";
import { StyleSheet, View, Text } from "react-native";
import { useUserContext } from "../../context/userContext";
import { TabThreeParamList } from "../../types";
import { getCommunityContract } from "../../utils";
import { celoWalletRequest, Transaction } from "../../utils/celoWallet";
import { GradientView, OutlinedButton } from "../../components/Themed";
import GlobalStyles from "../../constants/GlobalStyles";
import Colors from "../../constants/Colors";
import { Chip, Divider, TouchableRipple } from "react-native-paper";
import { Picker } from "@react-native-community/picker";
import Layout from "../../constants/Layout";

export default function SubmitLoanScreen({
  navigation,
  route,
}: StackScreenProps<TabThreeParamList, "SubmitLoan">) {
  const { loanAddress, amount, term, apy } = route.params;
  const { wallet } = useUserContext();
  const [submitted, setSubmitted] = useState(false);
  const [selectedValue, setSelectedValue] = useState("java");

  const submitLoan = async () => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const communityContract = getCommunityContract(
      kit,
      config.communityAddress
    );
    const submitLoanTx: Transaction = {
      from: wallet.address,
      to: communityContract.options.address,
      txObject: communityContract.methods.submit(loanAddress),
    };

    await celoWalletRequest([submitLoanTx], 'submitloan', kit);
    setSubmitted(true);
    navigation.navigate("Submitted");
  };

  const interest =
    Math.round(Number(amount) * (Number(term) / 365) * (Number(apy) / 100) * 100) / 100;

  return (
    <GradientView style={styles.container}>
      <View
        style={{
          width: Layout.window.width,
          padding: 20,
          marginTop: GlobalStyles.consts.headerContainerHeight / 2,
        }}
      >
        <View>
          <View style={[styles.card, styles.shadow]}>
            <View style={{ alignItems: "center", paddingVertical: 15 }}>
              <Text style={styles.header}>${Number(amount) + interest}</Text>
              <Text style={styles.body}>Total Amount Due</Text>
            </View>
            <Divider />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={styles.body}>Interest</Text>
                <Text style={styles.subheader}>${interest}</Text>
              </View>
              <View style={styles.vLine} />
              <View style={{ alignItems: "center" }}>
                <Text style={styles.body}>Due In</Text>
                <Text style={styles.subheader}>
                  {term}
                  <Text style={styles.body}>day(s)</Text>
                </Text>
              </View>
            </View>
          </View>
          <View>
            <Text
              style={{ ...GlobalStyles.styles.secondaryHeader, color: "white" }}
            >
              To:
            </Text>
            <TouchableRipple style={styles.picker}>
              <Picker
                selectedValue={selectedValue}
                style={{ height: 50, color: Colors.light.background }}
                itemStyle={{ backgroundColor: Colors.light.background }}
                mode="dropdown"
                onValueChange={(itemValue) =>
                  setSelectedValue(itemValue.toString())
                }
              >
                <Picker.Item
                  label="One World Vision"
                  value="One World Vision"
                />
                <Picker.Item label="Loanr" value="Loanr" />
              </Picker>
            </TouchableRipple>
          </View>
        </View>
      </View>
      <View style={{ width: Layout.window.width, padding: 20, flex: 1, justifyContent: "center" }}>
        <OutlinedButton
          onPress={submitLoan}
          text={submitted ? "Submitted" : "Submit Loan to Community"}
          style={{ marginTop: 20 }}
        />
      </View>
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
  header: {
    color: Colors.light.tint,
    ...GlobalStyles.styles.textHeader,
  },
  subheader: {
    color: Colors.light.tint,
    letterSpacing: 0.6,
    fontSize: 20,
    ...GlobalStyles.styles.secondaryHeader,
  },
  body: {
    paddingTop: 10,
    letterSpacing: 0.7,
    ...GlobalStyles.styles.textPrimary,
  },
  card: {
    borderRadius: GlobalStyles.consts.borderRadius,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  shadow: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  vLine: {
    backgroundColor: Colors.light.darkGrey,
    marginVertical: 10,
    width: 1,
  },
  picker: {
    marginVertical: 20,
    borderColor: Colors.light.background,
    borderWidth: 1,
    borderRadius: GlobalStyles.consts.borderRadius,
  },
});
