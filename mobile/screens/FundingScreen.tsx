import { newKitFromWeb3 } from "@celo/contractkit";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import config from "../config";
import Web3 from 'web3';
import { useUserContext } from "../context/userContext";
import { celoWalletRequest } from "../utils/celoWallet";
import { getCommunityContract } from "../utils";
import { useState } from "react";
import BigNumber from "bignumber.js";

export default function FundingScreen({ }) {
    const { wallet }  = useUserContext();
    const [ amount, setAmount ] = useState('');

    const fundCommunity = async (amount: number) => {
        const web3 = new Web3(config.jsonRpc);
        const kit = newKitFromWeb3(web3);
        const poolContract = getCommunityContract(kit, config.communityAddress)
        const stableToken = await kit.contracts.getStableToken();
        const cUSDDecimals = await stableToken.decimals();
        const amountCUSD = new BigNumber(amount)
                .multipliedBy(new BigNumber(10).pow(cUSDDecimals))
                .toString();
        const txObject = stableToken.approve(
            poolContract.options.address,
            amountCUSD,
        ).txo;
        // approve
        await celoWalletRequest(
            wallet.address,
            stableToken.address,
            txObject,
            'approvepool',
            kit 
        );
        // fund
        await celoWalletRequest(
            wallet.address,
            poolContract.options.address,
            poolContract.methods.join(amountCUSD),
            'fundpool',
            kit,
        );
    }

    return (
        <TouchableOpacity onPress={() => fundCommunity(Number(amount))}>
            <TextInput
                onChangeText={setAmount}
                value={amount}
                keyboardType='numeric'
            />
        </TouchableOpacity>
    )
}