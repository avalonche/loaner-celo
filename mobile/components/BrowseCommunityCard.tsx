import * as React from 'react';
import { View as DefaultView, Image} from 'react-native';
import { StyleSheet } from "react-native";

import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import { TouchableOpacity } from 'react-native-gesture-handler';
import GlobalStyles from '../constants/GlobalStyles';
import { CommunitySummary } from '../types';
import { View, Text } from './Themed';

export default function BrowseCommunityCard(props: CommunitySummary) {
    function nFormatter(num: number, digits: number = 0) {
      var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "B" },
        { value: 1E12, symbol: "T" },
      ];
      var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
      var i;
      for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
          break;
        }
      }
      return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    }
  
    return (
      // Add on press prop to navigate to community detail screen
      <TouchableOpacity style={{
        width: Layout.window.width * 0.9 - 10,
        flexDirection: 'column',
        marginTop: 10,
        marginHorizontal: 5,
        backgroundColor: 'white',
        borderRadius: 4,
        height: 290,
        shadowColor: '#000',
        shadowOffset: {
          width: 2,
          height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 5,
      }}>
        <Image
            style={{
              flexShrink: 2,
              flex: 1,
              width: Layout.window.width * 0.9 - 10,
            }}
            source={props.image}
        />
        <DefaultView style={{
          flexDirection: 'column',
          padding: 10,
          marginTop: -40,
          alignItems: 'center',
        }}>
          <View
            style={{
              padding: 10,
              borderColor: 'white',
              borderRadius: 30,
            }}
          >
            <Image
              style={{
                height: 40, 
                width: 40, 
                backgroundColor: 'white',
              }}
              source={props.logo}
            />
          </View>
          <DefaultView style={{
            paddingHorizontal: 15,
            paddingRight: 30,
            alignItems: 'center'
          }}>
            <Text numberOfLines={1} style={{fontSize: 16, fontFamily: 'Roboto_500Medium'}}>{props.name}</Text>
            <Text numberOfLines={2} style={{fontSize: 12, textAlign: 'center'}}>{props.description}</Text>
          </DefaultView>
        </DefaultView>
        <DefaultView style={{
          flexDirection: 'row',
          justifyContent: 'center',
          paddingTop: 20,
          paddingBottom: 30,
        }}>
          <DefaultView style={styles.statsContainer}>
            <Text style={styles.numerText}>{nFormatter(props.funders)}</Text>
            <Text style={styles.labelText}>Funders</Text>
          </DefaultView>
          <DefaultView style={styles.statsContainer}>
            <Text style={styles.numerText}>{nFormatter(props.loansMade)}</Text>
            <Text style={styles.labelText}>Loans Made</Text>
          </DefaultView>
          <DefaultView style={styles.statsContainer}>
            <Text style={styles.numerText}>{nFormatter(props.totalValueLocked)}</Text>
            <Text style={styles.labelText}>TVL</Text>
          </DefaultView>
        </DefaultView>
      </TouchableOpacity >
    )
  }
  
  const styles = StyleSheet.create({
    numerText: {
      ...GlobalStyles.styles.secondaryHeader,
      fontSize: GlobalStyles.consts.headerFontSize,
    },
    labelText: {
      ...GlobalStyles.styles.textPrimary,
    },
    statsContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
    }
  });