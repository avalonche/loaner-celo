import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { StyleSheet } from "react-native";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import TabTwoScreen from "../screens/TabTwoScreen";
import CommunitiesScreen from "../screens/CommunitiesScreen";
import GlobalStyles from "../constants/GlobalStyles";
import {
  BottomTabParamList,
  TabOneParamList,
  TabTwoParamList,
  TabThreeParamList,
  TabFourParamList,
} from "../types";
import FundingScreen from "../screens/FundingScreen";
import Profile from "../screens/ProfileScreen";
import RequestLoanScreen from "../screens/RequestLoanScreen";
import SubmitLoanScreen from "../screens/SubmitLoanScreen";
import ManageLoansScreen from "../screens/ManageLoansScreen";
import UserLoansScreen from "../screens/UserLoansScreen";
import ManageCommunitiesScreen from "../screens/ManageCommunitiesScreen";
import CommunityScreen from "../screens/CommunityScreen";

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Browse"
      tabBarOptions={{
        activeTintColor: Colors[colorScheme].tint,
        style: {
          paddingTop: 10,
          height: 70,
          alignItems: "center",
        },
        labelStyle: {
          margin: 0,
          flex: 1,
          fontFamily: GlobalStyles.consts.secondaryFontFamily,
          fontSize: GlobalStyles.consts.primaryFontSize,
          textTransform: "uppercase",
        },
      }}
    >
      <BottomTab.Screen
        name="Browse"
        component={BrowseTabNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="account-balance" color={color} />
          ),
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
        name="Loans"
        component={LoanTabNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="attach-money" color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Settings"
        component={SettingsTabNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
}) {
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
          headerTitle: "Communities",
          ...headerStyleOptions,
        }}
      />
      <BrowseTabStack.Screen
        name="Community"
        component={CommunityScreen}
        options={{ headerTitle: "", ...headerStyleOptions }}
      />
      <BrowseTabStack.Screen
        name="Fund"
        component={FundingScreen}
        options={{ headerTitle: "Fund Community", ...headerStyleOptions }}
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
        component={Profile}
        options={{
          headerTitle: "Profile",
          ...headerStyleOptions,
        }}
      />
      <ProfileTabStack.Screen
        name="ManageLoans"
        component={ManageLoansScreen}
        options={{
          headerTitle: "Manage Loans",
          ...headerStyleOptions,
        }}
      />
      <ProfileTabStack.Screen
        name="ManageCommunities"
        component={ManageCommunitiesScreen}
        options={{
          headerTitle: "Manage Communities",
          ...headerStyleOptions,
        }}
      />
    </ProfileTabStack.Navigator>
  );
}

const LoanTabStack = createStackNavigator<TabThreeParamList>();

function LoanTabNavigator() {
  return (
    <LoanTabStack.Navigator>
      <LoanTabStack.Screen
        name="UserLoans"
        component={UserLoansScreen}
        options={{
          headerTitle: "Your Loans",
          ...headerStyleOptions,
        }}
      />
      <LoanTabStack.Screen
        name="RequestLoan"
        component={RequestLoanScreen}
        options={{
          headerTitle: "Request Loan",
          ...headerStyleOptions,
        }}
      />
      <LoanTabStack.Screen
        name="SubmitLoan"
        component={SubmitLoanScreen}
        options={{
          headerTitle: "Submit Loan",
          ...headerStyleOptions,
        }}
      />
    </LoanTabStack.Navigator>
  );
}
const SettingsTabStack = createStackNavigator<TabFourParamList>();

function SettingsTabNavigator() {
  return (
    <SettingsTabStack.Navigator>
      <SettingsTabStack.Screen
        name="Settings"
        component={TabTwoScreen}
        options={{
          headerTitle: "Tab 2Title",
          ...headerStyleOptions,
        }}
      />
    </SettingsTabStack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerText: {
    ...GlobalStyles.styles.textHeader,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
    paddingLeft: 4,
  },
  headerContainer: {
    height: GlobalStyles.consts.headerContainerHeight,
  },
});

const headerStyleOptions = {
  headerStyle: styles.headerContainer,
  headerTransparent: true,
  headerTintColor: "#fff",
  headerTitleStyle: styles.headerText,
};
