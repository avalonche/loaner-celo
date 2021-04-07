import { newKitFromWeb3 } from "@celo/contractkit";
import { BigNumber } from "bignumber.js";
import React, { useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import Web3 from "web3";
import LoanCard from "../components/ManageLoanCard";
import { GradientView } from "../components/Themed";
import config from "../config";
import { useLoanContext } from "../context/loanContext";
import { Loan, LoanStatus } from "../types/state";
import { getLoanFactoryContract } from "../utils";

export default function ManageLoansScreen() {
  const { loans, setLoans } = useLoanContext();
  useEffect(() => {
    const getLoans = async () => {
      const web3 = new Web3(config.jsonRpc);
      const kit = newKitFromWeb3(web3);
      const loanFactoryContract = getLoanFactoryContract(
        kit,
        config.loanFactoryAddress
      );
      const events = await loanFactoryContract.getPastEvents(
        "LoanTokenCreated",
        {
          fromBlock: 0,
          toBlock: "latest",
        }
      );
      const fetchedLoans: Loan[] = await Promise.all(
        events.map(async ({ returnValues }) => {
          const loanTokenContract = getLoanFactoryContract(
            kit,
            returnValues.contractAddress
          );
          const apy = await loanTokenContract.methods.apy().call();
          const term = await loanFactoryContract.methods.term().call();
          const amount = await loanFactoryContract.methods.amount().call();
          const borrower: string = await loanFactoryContract.methods
            .amount()
            .call();
        const status: LoanStatus = await loanFactoryContract.methods.status().call();
          return {
            loanAddress: loanTokenContract.options.address,
            apy: new BigNumber(apy).toString(),
            term: new BigNumber(term).toString(),
            amount: new BigNumber(amount).toString(),
            borrower: borrower,
            status,
          };
        })
      );
      setLoans(fetchedLoans);
    };
    getLoans();
  }, []);

  const LoansList = loans.map((loan, index) => {
    return <LoanCard key={index} {...loan} />;
  });

  return (
    <GradientView>
      <ScrollView>{LoansList}</ScrollView>
    </GradientView>
  );
};
