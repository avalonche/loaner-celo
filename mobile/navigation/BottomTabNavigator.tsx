import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { StyleSheet } from "react-native";

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import LandingScreen from '../screens/LandingScreen';
import GlobalStyles from '../constants/GlobalStyles'
import { BottomTabParamList, TabOneParamList, TabTwoParamList, TabThreeParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Browse"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="Browse"
        component={BrowseTabNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="account-balance" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileTabNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Settings"
        component={SettingsTabNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof MaterialIcons>['name']; color: string }) {
  return <MaterialIcons size={20} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const BrowseTabStack = createStackNavigator<TabOneParamList>();

function BrowseTabNavigator() {
  return (
    <BrowseTabStack.Navigator>
      <BrowseTabStack.Screen
        name="Browse"
        component={CommunitiesScreen}
        options={{ 
          headerTitle: 'Communities',
          ...headerStyleOptions,
        }}
      />
    </BrowseTabStack.Navigator>
  );
}

const ProfileTabStack = createStackNavigator<TabTwoParamList>();

function ProfileTabNavigator() {
  return (
    <ProfileTabStack.Navigator>
      <ProfileTabStack.Screen
        name="Profile"
        component={TabTwoScreen}
        options={{ 
          headerTitle: 'Tab 2Title',
          ...headerStyleOptions,
        }}
      />
    </ProfileTabStack.Navigator>
  );
}
const SettingsTabStack = createStackNavigator<TabThreeParamList>();

function SettingsTabNavigator() {
  return (
    <SettingsTabStack.Navigator>
      <SettingsTabStack.Screen
        name="Settings"
        component={TabTwoScreen}
        options={{ 
          headerTitle: 'Tab 2Title',
          ...headerStyleOptions,
        }}
      />
    </SettingsTabStack.Navigator>
  );
}


const styles = StyleSheet.create({
  headerText: {
    ...GlobalStyles.styles.textHeader,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  headerContainer: {
    height: GlobalStyles.consts.headerContainerHeight,
  },
});

const headerStyleOptions = {
  headerStyle: styles.headerContainer,
  headerTransparent: true,
  headerTintColor: '#fff',
  headerTitleStyle: styles.headerText,
}