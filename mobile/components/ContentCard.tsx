import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { Image, StyleSheet, View as DefaultView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import GlobalStyles from '../constants/GlobalStyles';
import Layout from '../constants/Layout';
import { ContainedButton } from '../components/Themed';
import { CommunitySummary, TabOneParamList } from '../types';
import { Text, View } from './Themed';

/**
 * Generic card with title, string content and optional bottom add-on component
 */
export default function ContentCard(props: {
  title: string,
  content: string,
  bottomAddon: Component,
}) {
  const title = <Text numberOfLines={1} style={styles.title}>{props.title}</Text>;
  const content = props.content !== undefined ?
    <Text numberOfLines={4} style={{fontSize: 16}}>
      {props.content}
    </Text> : null;
  const bottomAddonContainer = props.bottomAddon !== undefined ?
    <DefaultView style={{
      justifyContent: 'center',
      paddingVertical: 10,
    }}>
      {props.bottomAddon}
    </DefaultView> : null;
  return (
    // Add on press prop to navigate to community detail screen
    <DefaultView
      style={{
        width: Layout.window.width * 0.9 - 10,
        flexDirection: 'column',
        marginTop: 10,
        marginHorizontal: 5,
        backgroundColor: 'white',
        borderRadius: 4,
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
        flexDirection: 'column',
        padding: 10,
        marginHorizontal: 15,
      }}>
        <DefaultView>
          {title}
          {content}
        </DefaultView>
        {bottomAddonContainer}
      </DefaultView>
    </DefaultView >
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 10,
  },
});
