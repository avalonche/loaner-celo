import { newKitFromWeb3 } from "@celo/contractkit";
import { StackScreenProps } from "@react-navigation/stack";
import { useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import Web3 from 'web3';
import config from "../config";
import { useUserContext } from "../context/userContext";
import { TabThreeParamList } from "../types";
import { getCommunityContract } from "../utils";
import { celoWalletRequest, Transaction } from "../utils/celoWallet";

export default function SubmitLoanScreen({
  route,
}: StackScreenProps<TabThreeParamList, "SubmitLoan">) {
  const { loanAddress } = route.params;
  const { wallet } = useUserContext();
  const [ submitted, setSubmitted ] = useState(false);

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
  };

  return (
    <TouchableOpacity onPress={submitLoan}>
      {submitted ? "Submit Loan to Community" : "Submitted"}
    </TouchableOpacity>
  );
}
