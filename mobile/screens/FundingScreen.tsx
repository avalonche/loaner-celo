import { newKitFromWeb3 } from "@celo/contractkit";
import { BigNumber } from "bignumber.js";
import { useState } from "react";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import Web3 from 'web3';
import config from "../config";
import { useUserContext } from "../context/userContext";
import { getPoolContract } from "../utils";
import { celoWalletRequest, Transaction } from "../utils/celoWallet";

export default function FundingScreen({ }) {
    const { wallet }  = useUserContext();
    const [ amount, setAmount ] = useState('');

    const fundCommunity = async (amount: number) => {
        const web3 = new Web3(config.jsonRpc);
        const kit = newKitFromWeb3(web3);
        const poolContract = getPoolContract(kit, config.poolAddress)
        const stableToken = await kit.contracts.getStableToken();
        const cUSDDecimals = await stableToken.decimals();
        const amountCUSD = new BigNumber(amount)
                .multipliedBy(new BigNumber(10).pow(cUSDDecimals))
                .toString();
        const txObject = stableToken.approve(
            poolContract.options.address,
            amountCUSD,
        ).txo;
        const approveTx: Transaction = {
            from: wallet.address,
            to: stableToken.address,
            txObject,
        }
        const fundTx: Transaction = {
            from: wallet.address,
            to: poolContract.options.address,
            txObject: poolContract.methods.join(amountCUSD),
        }
        // approve
        await celoWalletRequest(
            [approveTx, fundTx],
            'fundpool',
            kit 
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