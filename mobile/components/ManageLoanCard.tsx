import { BigNumber } from "bignumber.js";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors";
import GlobalStyles from "../constants/GlobalStyles";
import { ContactSummary } from "../types";
import { Loan } from "../types/state";
import {
  fromApy,
  fromTerm
} from "../utils";

export default function LoanCard(props: Loan & ContactSummary) {
  const { apy, term, amount, contact, phone } = props;

  return (
    <View style={styles.loan}>
      <View style={{ paddingBottom: 10 }}>
        <Text style={GlobalStyles.styles.textPrimary}>From:</Text>
        <Text style={GlobalStyles.styles.secondaryHeader}>
          {`${contact} (${phone})`}
        </Text>
      </View>
      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Text style={styles.header}>
          $
          {new BigNumber(amount)
            .dividedBy(new BigNumber(10).pow(18))
            .toFixed(0)
            .toString()}
        </Text>
        <Text style={styles.header}>{fromApy(apy)}%</Text>
        <Text style={styles.header}>
          {fromTerm(term)}
          <Text style={GlobalStyles.styles.textPrimary}>day(s)</Text>
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={GlobalStyles.styles.textPrimary}>loan size</Text>
        <Text style={GlobalStyles.styles.textPrimary}>annualized interest</Text>
        <Text style={GlobalStyles.styles.textPrimary}>loan duration</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loan: {
    padding: 20,
    marginBottom: 15,
    borderRadius: GlobalStyles.consts.borderRadius,
    backgroundColor: Colors.light.background,
  },
  header: {
    color: Colors.light.tint,
    ...GlobalStyles.styles.textHeader,
  },
  shadow: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});
