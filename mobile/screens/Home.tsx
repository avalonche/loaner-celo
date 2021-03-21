import * as Linking from 'expo-linking';
import { useState } from 'react';
import { requestAccountAddress, waitForAccountAuth } from '@celo/dappkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Button } from 'react-native';
import { STORAGE_USER_ADDRESS, STORAGE_USER_PHONE } from '../constants';
import { getUserBalance } from '../utils';
import { newKitFromWeb3 } from '@celo/contractkit';
import config from '../config';
import { useUserContext } from '../context/userContext';
import Web3 from 'web3';


export default function Home() {
    const [connecting, setConnecting] = useState(false);
    const { setUserWallet } = useUserContext();

    const setupUser = async (address: string, phoneNumber: string) => {
        const web3 = new Web3(config.jsonRpc);
        const kit = newKitFromWeb3(web3);
        const balance = await getUserBalance(kit, address);
        setUserWallet({
            address,
            phoneNumber,
            balance: balance.toString(),
        });
    };

    const connectValora = async () => {
        const requestId = 'login';
        const dappName = 'loaner';
        const callback = Linking.makeUrl('/');
        setConnecting(true);
        let dappkitResponse;
        try {
            requestAccountAddress({
                requestId,
                dappName,
                callback,
            });
            dappkitResponse = await waitForAccountAuth(requestId);
        } catch (e) {
            Alert.alert(
                "Connection Failed",
                "Failed to connect to Valora wallet",
                [{ text: 'Close' }],
                { cancelable: false },
            );
            setConnecting(false);
            return;
        }
        try {
            await AsyncStorage.setItem(STORAGE_USER_ADDRESS, dappkitResponse.address);
            await AsyncStorage.setItem(STORAGE_USER_PHONE, dappkitResponse.phoneNumber);
            await setupUser(dappkitResponse.address, dappkitResponse.phoneNumber);
        } catch (e) {
            Alert.alert(
                "Error Initializing Wallet",
                "Failed to initialize wallet. Please try again.",
                [{ text: 'Close' }],
                { cancelable: false },
            );
            setConnecting(false);
        }
    }

    return (
        <Button
            onPress={connectValora}
            title="Connect to Valora"
        />
    );
}