import { newKitFromWeb3 } from "@celo/contractkit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, { Event } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-community/picker";
import Slider from "@react-native-community/slider";
import { StackScreenProps } from "@react-navigation/stack";
import { BigNumber } from "bignumber.js";
import rgba from "hex-to-rgba";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableRipple } from "react-native-paper";
import Web3 from "web3";
import ContentCard from "../../components/ContentCard";
import { GradientView, OutlinedButton } from "../../components/Themed";
import config from "../../config";
import Colors from "../../constants/Colors";
import GlobalStyles from "../../constants/GlobalStyles";
import { useUserContext } from "../../context/userContext";
import { TabThreeParamList } from "../../types";
import { getLoanFactoryContract, toApy, toTerm } from "../../utils";
import { celoWalletRequest, Transaction } from "../../utils/celoWallet";

export default function RequestLoanScreen({
  navigation,
}: StackScreenProps<TabThreeParamList, "SubmitLoan">) {
  // community settings to quote interest rate
  const [apy, setApy] = useState("10");
  const [term, setTerm] = useState(1);
  const [amount, setAmount] = useState(1);
  const [date, setDate] = useState(new Date()); // one day after
  const [show, setShow] = useState(false);

  const { wallet } = useUserContext();

  const onChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(
      Math.abs((currentDate.getTime() - new Date().getTime()) / oneDay)
    );
    setTerm(diffDays);
    setShow(Platform.OS === "ios");
    setDate(currentDate);
  };

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
      loanAddress:
        "0x" + loanAddress.slice(loanAddress.length - 40, loanAddress.length),
      amount,
      term,
      apy,
    });
  };

  return (
    <GradientView style={styles.container}>
      <View
        style={{
          marginTop: GlobalStyles.consts.headerContainerHeight / 2,
        }}
      >
        <Text style={styles.header}>Loan Amount</Text>
        <Text style={styles.labelText}>
          Specify the loan amount you wish to take out
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
          <Text style={styles.description}>$1</Text>
          <Slider
            style={{ flex: 1 }}
            minimumValue={1}
            maximumValue={1000}
            minimumTrackTintColor={rgba("#CC66FF", `${0.5}`)}
            maximumTrackTintColor={rgba(Colors.light.darkGrey, `${0.5}`)}
            thumbTintColor={"#CC66FF"}
            value={amount}
            onValueChange={setAmount}
            step={1}
          />
          <Text style={styles.description}>$1000</Text>
        </View>
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            is24Hour={true}
            display="default"
            onChange={onChange}
          />
        )}
        <Text style={styles.header}>Loan Duration</Text>
        <Text style={styles.labelText}>
          Specify the date of your loan repayment
        </Text>
        <View>
          <TextInput
            style={styles.input}
            editable={false}
            value={date.toLocaleDateString()}
            placeholder="Choose date for repayment..."
            placeholderTextColor={Colors.light.placeholder}
          />
          <View style={styles.calendar}>
            <TouchableRipple onPress={() => setShow(true)}>
              <MaterialCommunityIcons
                name="calendar-multiselect"
                size={28}
                color="black"
              />
            </TouchableRipple>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 20,
          }}
        >
          <Text style={styles.header}>Interest Rate</Text>
          <View
            style={{
              backgroundColor: Colors.light.background,
              borderRadius: GlobalStyles.consts.borderRadius,
            }}
          >
            <Picker
              selectedValue={apy}
              style={{ height: 40, width: 95 }}
              itemStyle={{ paddingLeft: 5 }}
              onValueChange={(itemValue) => setApy(itemValue.toString())}
            >
              <Picker.Item label="10%" value="10" />
              <Picker.Item label="20%" value="20" />
              <Picker.Item label="30%" value="30" />
            </Picker>
          </View>
        </View>
        <OutlinedButton
          text={"Create Loan"}
          style={{ marginTop: 20 }}
          onPress={() => createLoan(apy, term.toString(), amount.toString())}
        />
      </View>
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
  input: {
    marginVertical: 10,
    paddingRight: 30,
    textAlign: "center",
    paddingLeft: 5,
    fontSize: 15,
    fontWeight: "500",
    color: "black",
    backgroundColor: Colors.light.background,
    borderBottomColor: Colors.light.lightGray,
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 14 * 3,
    borderRadius: GlobalStyles.consts.borderRadius,
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
  statsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 16,
    borderColor: "white",
    borderWidth: 3,
    backgroundColor: "green",
  },
  calendar: {
    position: "absolute",
    alignItems: "flex-end",
    width: 25,
    height: 25,
    right: 10,
    bottom: 20,
  },
});
