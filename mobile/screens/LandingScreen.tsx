import { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, GradientView, View, ContainedButton, OutlinedButton } from '../components/Themed';
import GlobalStyles from '../constants/GlobalStyles'
import Navigation from '../navigation';
import { StatusBar } from 'expo-status-bar';
import useColorScheme from "../hooks/useColorScheme";

const logo = require('../assets/images/logo.png')

export type ColorScheme = "light" | "dark";

export default function LandingScreen() : JSX.Element {
    const colorScheme = useColorScheme();
    const styles = createStyles(colorScheme);
    // TODO(chloe): In the future we'll use context or redux to check whether a user is 
    // Authenticated or not  
    const [user, setUser] = useState(false);
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
                  onPress={() => setUser(true)} 
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
