import { newKitFromWeb3 } from "@celo/contractkit";
import { StackScreenProps } from "@react-navigation/stack";
import { BigNumber } from "bignumber.js";
import faker from "faker";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Modal, Portal, Provider } from "react-native-paper";
import Web3 from "web3";
import LoanCard from "../../../components/ManageLoanCard";
import { ContainedButton, GradientView } from "../../../components/Themed";
import config from "../../../config";
import Colors from "../../../constants/Colors";
import GlobalStyles from "../../../constants/GlobalStyles";
import Layout from "../../../constants/Layout";
import { ContactSummary, TabOneParamList } from "../../../types";
import { Loan, LoanStatus } from "../../../types/state";
import { getCommunityContract, getLoanTokenContract } from "../../../utils";

export default function ManageLoansScreen({
  navigation,
  route,
}: StackScreenProps<TabOneParamList, "ManageLoans">) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const { loansMade, name } = route.params;
  const filteredLoans = loans.filter(
    ({ status }) => status === LoanStatus.Pending
  );
  const accounts = generateContacts(filteredLoans.length);

  const [selectedLoan, setSelectedLoan] = useState<number>();
  const [visible, setVisible] = useState(false);

  const showModal = (loanIndex: number) => {
    setVisible(true);
    setSelectedLoan(loanIndex);
  };
  const hideModal = () => {
    setVisible(false);
    setSelectedLoan(undefined);
  };

  useEffect(() => {
    const getLoans = async () => {
      const web3 = new Web3(config.jsonRpc);
      const kit = newKitFromWeb3(web3);
      const communityContract = getCommunityContract(
        kit,
        config.communityAddress
      );
      const events = await communityContract.getPastEvents("LoanSubmitted", {
        fromBlock: 0,
        toBlock: "latest",
      });
      const fetchedLoans: Loan[] = [];
      await Promise.all(
        events.map(async ({ returnValues }) => {
          const loanTokenContract = getLoanTokenContract(kit, returnValues.id);
          const pool: string = await loanTokenContract.methods
            .lender()
            .call();
          const borrower: string = await loanTokenContract.methods
            .borrower()
            .call();
          if (pool.toLowerCase() !== config.poolAddress.toLowerCase()) {
            return;
          }
          const apy = await loanTokenContract.methods.apy().call();
          const term = await loanTokenContract.methods.term().call();
          const amount = await loanTokenContract.methods.amount().call();
          const status: string = await communityContract.methods
            .status(loanTokenContract.options.address)
            .call();
          const internalStatus: string = await loanTokenContract.methods
            .status()
            .call();
          const balance: string = await loanTokenContract.methods
            .balance()
            .call();
          const start: string = await loanTokenContract.methods.start().call();
          fetchedLoans.push({
            loanAddress: loanTokenContract.options.address,
            apy: new BigNumber(apy).toString(),
            term: new BigNumber(term).toString(),
            amount: new BigNumber(amount).toString(),
            borrower: borrower,
            internalStatus: Number(internalStatus),
            status: Number(status),
            pool,
            balance,
            start,
          });
        })
      );
      setLoans(fetchedLoans);
    };
    getLoans();
  }, []);

  const stakeNavigate = (amount: string, approved: boolean) => {
    navigation.navigate("StakeLoan", {
      loanAddress: filteredLoans[selectedLoan!].loanAddress,
      amount,
      approved,
      ...route.params,
    });
    hideModal();
  };

  const renderHeader = () => {
    return (
      <View style={[styles.shadow, styles.header]}>
        <View style={{ paddingHorizontal: 30, paddingTop: 20 }}>
          <Text style={GlobalStyles.styles.secondaryHeader}>
            Loans Overview
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 30,
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={GlobalStyles.styles.textHeader}>
              {filteredLoans.length}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={GlobalStyles.styles.textHeader}>{loansMade}</Text>
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: 30,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={GlobalStyles.styles.textPrimary}>Pending</Text>
          <Text style={GlobalStyles.styles.textPrimary}>Approved</Text>
        </View>
      </View>
    );
  };

  const renderLoans = () => {
    return (
      <View style={styles.loans}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.loansHeader}>
            <Text
              style={{
                color: Colors.light.background,
                fontFamily: "Roboto_700Bold",
              }}
            >
              Pending Loans
            </Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text
                style={{
                  color: Colors.light.background,
                  fontFamily: "Roboto_100Thin",
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {filteredLoans.map((loan, index) => (
            <TouchableOpacity
              onPress={() => showModal(index)}
              activeOpacity={0.8}
              key={`loan-${index}`}
            >
              <LoanCard {...loan} {...accounts[index]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderModal = () => {
    const amount =
      typeof selectedLoan !== "undefined"
        ? filteredLoans[selectedLoan].amount
        : "";
    const contact =
      typeof selectedLoan !== "undefined" ? accounts[selectedLoan].contact : "";
    return (
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.modal}
      >
        <Text
          style={{
            color: Colors.light.text,
            ...GlobalStyles.styles.textHeader,
          }}
        >
          Approve Loan
        </Text>
        <Text style={{ marginVertical: 10 }}>
          Approve
          <Text style={{ color: Colors.light.link }}> {contact}</Text>
          's loan for
          <Text style={{ color: Colors.light.link }}> {name}</Text>?
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <ContainedButton
            text={"Approve"}
            onPress={() => stakeNavigate(amount, true)}
            style={{ margin: 10, backgroundColor: Colors.light.tint }}
            textStyles={{ color: Colors.light.background }}
          />
          <ContainedButton
            text={"Reject"}
            onPress={() => stakeNavigate(amount, false)}
            style={{ margin: 10 }}
          />
        </View>
      </Modal>
    );
  };

  return (
    <GradientView style={styles.container}>
      <Provider>
        <Portal>{renderModal()}</Portal>
        <View
          style={{
            width: Layout.window.width,
            paddingHorizontal: 20,
            marginTop: GlobalStyles.consts.headerContainerHeight,
          }}
        >
          {renderHeader()}
          {renderLoans()}
        </View>
      </Provider>
    </GradientView>
  );
}

const addresses = [
  "0xcd421b34F15802b534EC1Dc98B98Ee6CCB416114",
  "0x7520f8e4b33e869a23a80bd6bef44eed0d3d23fa",
];
const generateContacts = (amount: number): ContactSummary[] => {
  faker.seed(123);
  const fakeContacts: ContactSummary[] = [];
  for (let i = 0; i < amount; i++) {
    fakeContacts.push({
      contact: `${faker.name.firstName()} ${faker.name.lastName()}`,
      phone: faker.phone.phoneNumberFormat(2),
      address: i === 0 ? addresses[0] : addresses[1],
    });
  }
  return fakeContacts;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loans: {
    marginTop: -55,
    paddingTop: 55 + 20,
    paddingHorizontal: 15,
  },
  loansHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  header: {
    paddingBottom: 30,
    zIndex: 1,
    borderRadius: GlobalStyles.consts.borderRadius,
    backgroundColor: Colors.light.lightGray,
  },
  shadow: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: GlobalStyles.consts.borderRadius,
  },
});
