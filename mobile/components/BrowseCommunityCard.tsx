import * as React from 'react';
import { View as DefaultView, Image} from 'react-native';

import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import { TouchableOpacity } from 'react-native-gesture-handler';
import GlobalStyles from '../constants/GlobalStyles';
import { CommunitySummary } from '../types';
import { View, Text } from './Themed';

export default function BrowseCommunityCard(props: CommunitySummary) {
  
    return (
      <View style={{
        width: Layout.window.width * 0.9 - 10,
        flexDirection: 'column',
        marginTop: 10,
        marginHorizontal: 5,
        backgroundColor: 'white',
        borderRadius: 4,
        height: 300,
        shadowColor: '#000',
        shadowOffset: {
          width: 2,
          height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 5,
      }}>
        <DefaultView style={{
          flexDirection: 'row',
          padding: 10,
          alignItems: 'center',
        }}>
          <Image
            style={{height: 30, width: 30}}
            source={props.logo}
          />
          <DefaultView style={{
            paddingHorizontal: 15,
            paddingRight: 30,
          }}>
            <Text numberOfLines={1} style={{fontSize: 16, fontFamily: 'Roboto_500Medium'}}>{props.name}</Text>
            <Text numberOfLines={1} style={{fontSize: 12}}>{props.subtitle}</Text>
          </DefaultView>
        </DefaultView>
        <Image
            style={{
              flexShrink: 2,
              flex: 2,
              width: Layout.window.width * 0.9 - 10,
            }}
            source={props.image}
        />
        <DefaultView style={{
          padding: 10,
        }}>
          <Text numberOfLines={2}>{props.description}</Text>
        </DefaultView>
        <DefaultView style={{
          flexDirection: 'row',
          padding: 10,
        }}>
          <TouchableOpacity>
            <Text style={{color: Colors.light.link, ...GlobalStyles.styles.link}}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginLeft: 15}}>
            <Text style={{color: Colors.light.link, ...GlobalStyles.styles.link}}>Donate</Text>
          </TouchableOpacity>
        </DefaultView>
      </View>
    )
  }
  