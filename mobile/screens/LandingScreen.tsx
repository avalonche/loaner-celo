import { newKitFromWeb3 } from '@celo/contractkit';
import { requestAccountAddress, waitForAccountAuth } from '@celo/dappkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';
import Web3 from 'web3';
import { ContainedButton, GradientView, OutlinedButton, Text, View } from '../components/Themed';
import config from '../config';
import { STORAGE_USER_ADDRESS, STORAGE_USER_PHONE } from '../constants';
import GlobalStyles from '../constants/GlobalStyles';
import { useUserContext } from '../context/userContext';
import useColorScheme from "../hooks/useColorScheme";
import Navigation from '../navigation';
import { getUserBalance } from '../utils';


const logo = require('../assets/images/logo.png')

export type ColorScheme = "light" | "dark";

export default function LandingScreen() : JSX.Element {
    const colorScheme = useColorScheme();
    const styles = createStyles(colorScheme);
    // TODO(chloe): In the future we'll use context or redux to check whether a user is 
    // Authenticated or not  
    const [user, setUser] = useState(false);
    const [connecting, setConnecting] = useState(false);
    // React Context
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

    if (!user) {
        // TODO(chloe): probably move this all into a separate component called - GreetingScreen
        return (
          <GradientView style={styles.container}>
          <View style={{...styles.container, ...styles.logoContainer}}>
            <Image
                style={{height: 50}}
                source={logo}
              />
          </View>
          <View style={{
              ...styles.container,
              alignItems: 'stretch',
              justifyContent: 'flex-start'
          }}>
              <ContainedButton 
                  onPress={() => connectValora()} 
                  text="Connect with Wallet"
                  />
              <OutlinedButton 
                  onPress={() => setUser(true)} 
                  text="Browse Loans"
                  style={{marginVertical: 20}}
              />
              <Text style={styles.text}>
                  Loanr enables decentralised
                  microfinancing services for
                  vulnerable communities.
              </Text>
          </View>
          </GradientView>
        );
    }
    return (
        <>
            <Navigation colorScheme={colorScheme} />
        </>
    )
}

const createStyles = (colorScheme: ColorScheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 20,
  },
  logoContainer: {
    flexGrow: 1,
    paddingTop: 100,
  },
  title: {
    fontSize: GlobalStyles.consts.headerFontSize,
    fontWeight: 'bold',
  },
  text: {
    ...GlobalStyles.styles.textPrimary,
    color: 'white',  
    textAlign: 'center',
    marginTop: 30,
  },
});
