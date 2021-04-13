import { newKitFromWeb3 } from "@celo/contractkit";
import { StackScreenProps } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Divider, Modal, Portal, Provider } from "react-native-paper";
import Web3 from "web3";
import ContentCard from "../../components/ContentCard";
import { ContainedButton, GradientView } from "../../components/Themed";
import config from "../../config";
import Colors from "../../constants/Colors";
import GlobalStyles from "../../constants/GlobalStyles";
import Layout from "../../constants/Layout";
import { useUserContext } from "../../context/userContext";
import { TabThreeParamList } from "../../types";
import { InternalLoanStatus, Loan, LoanStatus } from "../../types/state";
import {
  dayDiff,
  fromAmount,
  fromInterest,
  getCommunityContract,
  getLoanTokenContract,
  getPoolContract,
} from "../../utils";
import { celoWalletRequest, Transaction } from "../../utils/celoWallet";

export default function UserLoansScreen({
  navigation,
}: StackScreenProps<TabThreeParamList, "RequestLoan">) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const { wallet } = useUserContext();
  const [visible, setVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan>();
  const [debt, setDebt] = useState("0");

  const showModal = async (loan: Loan) => {
    const { loanAddress } = loan;
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const loanTokenContract = getLoanTokenContract(kit, loanAddress);
    const debt = await loanTokenContract.methods.debt().call();
    setDebt(debt);
    setSelectedLoan(loan);
    setVisible(true);
  };
  const hideModal = () => setVisible(false);

  useEffect(() => {
    const getLoans = async () => {
      const web3 = new Web3(config.jsonRpc);
      const kit = newKitFromWeb3(web3);
      const loanPoolContract = getPoolContract(kit, config.poolAddress);
      const communityContract = getCommunityContract(
        kit,
        config.communityAddress
      );
      const events = await loanPoolContract.getPastEvents("Funded", {
        fromBlock: 0,
        toBlock: "latest",
      });
      const fetchedLoans: Loan[] = [];
      await Promise.all(
        events.map(async ({ returnValues }) => {
          const loanTokenContract = getLoanTokenContract(
            kit,
            returnValues.loanToken
          );
          const pool: string = await loanTokenContract.methods.lender().call();
          const borrower: string = await loanTokenContract.methods
            .borrower()
            .call();
          if (
            pool.toLowerCase() !== config.poolAddress.toLowerCase() ||
            borrower.toLowerCase() !== wallet.address.toLowerCase()
          ) {
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

  const withdrawFunds = async (loanAddress: string) => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const loanContract = getLoanTokenContract(kit, loanAddress);
    const withdrawTx: Transaction = {
      from: wallet.address,
      to: loanContract.options.address,
      txObject: loanContract.methods.withdraw(wallet.address),
    };
    await celoWalletRequest([withdrawTx], "withdrawloan", kit);
    hideModal();
  };

  // const repayFunds = async (loanAddress: string, amount: string) => {
  //   const web3 = new Web3(config.jsonRpc);
  //   const kit = newKitFromWeb3(web3);
  //   const loanContract = getLoanTokenContract(kit, loanAddress);
  //   const withdrawTx: Transaction = {
  //     from: wallet.address,
  //     to: loanContract.options.address,
  //     txObject: loanContract.methods.repay(wallet.address),
  //   };
  //   await celoWalletRequest([withdrawTx], "withdrawloan", kit);
  //   hideModal();
  // };

  const activeLoanList = loans.filter(
    ({ status, start, term }) =>
      status === LoanStatus.Running &&
      new Date().getTime() / 1000 < Number(start) + Number(term)
  );

  const renderLoan = (loan: Loan) => {
    const { amount, apy, term, balance, start, internalStatus } = loan;
    const interest = fromInterest(amount, apy, term);
    const daysLeft = dayDiff(start, term);
    const totalLoan = Number(fromAmount(amount)) + Number(interest);
    return (
      <TouchableOpacity onPress={() => showModal(loan)}>
        <View style={[styles.card, styles.shadow]}>
          <View style={{ alignItems: "center", paddingVertical: 15 }}>
            <Text style={styles.cardHeader}>${fromAmount(balance)}</Text>
            <Text style={styles.cardBody}>Available Balance</Text>
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
              <Text style={styles.cardBody}>Amount Due</Text>
              <Text style={styles.cardSubheader}>
                $
                {internalStatus === InternalLoanStatus.Withdrawn
                  ? totalLoan - Number(fromAmount(balance))
                  : totalLoan}
              </Text>
            </View>
            <View style={styles.vLine} />
            <View style={{ alignItems: "center" }}>
              <Text style={styles.cardBody}>Due In</Text>
              <Text style={styles.cardSubheader}>
                {daysLeft}
                <Text style={styles.cardBody}>day(s)</Text>
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderModal = () => {
    return (
      <>
        <Text style={styles.cardSubheader}>Loan Funds</Text>
        <Text
          style={{
            ...GlobalStyles.styles.textPrimary,
            fontSize: 14,
            paddingTop: 10,
          }}
        >
          You can withdraw up to the balance in the loan. You can repay or
          withdraw from the balance of this loan anytime for the duration of the
          loan.
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            marginTop: 20,
          }}
        >
          {selectedLoan?.balance !== "0" && (
            <ContainedButton
              style={{ marginRight: 10 }}
              text={"Withdraw Funds"}
              onPress={() => withdrawFunds(selectedLoan!.loanAddress)}
            />
          )}
          {selectedLoan?.internalStatus === InternalLoanStatus.Withdrawn &&
            selectedLoan?.balance !== debt && (
              <ContainedButton
                style={{ marginLeft: 10 }}
                text={"Repay Loan"}
                onPress={() => {
                  navigation.navigate("RepayLoan", {
                    loanAddress: selectedLoan?.loanAddress,
                    debt,
                  })
                  hideModal();
                }
                }
              />
            )}
        </View>
      </>
    );
  };

  return (
    <GradientView style={styles.container}>
      <Provider>
        <ScrollView style={styles.scrollContainer}>
          <Portal>
            <Modal
              visible={visible}
              onDismiss={hideModal}
              contentContainerStyle={styles.modal}
            >
              {renderModal()}
            </Modal>
          </Portal>
          <ContentCard
            title={"Request a Loan"}
            content={
              "Request to borrow money here. You will submit an application that will be reviewed by your community leaders."
            }
            bottomAddon={
              <ContainedButton
                onPress={() => navigation.navigate("RequestLoan")}
                text={"Request Loan"}
              />
            }
          />
          <Text style={styles.header}>Approved Loans</Text>
          {activeLoanList.length > 0 ? (
            <FlatList
              horizontal
              pagingEnabled
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              snapToAlignment="center"
              style={[styles.shadow, { overflow: "visible" }]}
              data={activeLoanList}
              keyExtractor={(item) => `${item.loanAddress}`}
              renderItem={({ item }) => renderLoan(item)}
            />
          ) : (
            <Text style={styles.body}>
              You currently don't have any approved loans
            </Text>
          )}
          <Text style={{ paddingVertical: 40 }} />
        </ScrollView>
      </Provider>
    </GradientView>
  );
}

const styles = StyleSheet.create({
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
  },
  modal: {
    margin: 10,
    backgroundColor: Colors.light.background,
    padding: 20,
    borderRadius: GlobalStyles.consts.borderRadius,
  },
});
