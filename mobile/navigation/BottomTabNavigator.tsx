import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  getFocusedRouteNameFromRoute,
  RouteProp,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";
import GlobalStyles from "../constants/GlobalStyles";
import useColorScheme from "../hooks/useColorScheme";
import CommunitiesScreen from "../screens/browse/CommunitiesScreen";
import CommunityScreen from "../screens/browse/CommunityScreen";
import FundedScreen from "../screens/browse/fund/FundedScreen";
import FundingScreen from "../screens/browse/fund/FundingScreen";
import AddContactScreen from "../screens/browse/manage/AddContactScreen";
import AddedScreen from "../screens/browse/manage/AddedScreen";
import ManageLoansScreen from "../screens/browse/manage/ManageLoansScreen";
import ManageFundsScreen from "../screens/browse/manage/ManageFundsScreen";
import SuccessScreen from "../screens/browse/manage/SuccessScreen";
import StakedScreen from "../screens/browse/manage/StakedScreen";
import StakeLoanScreen from "../screens/browse/manage/StakeLoanScreen";
import RepaidScreen from "../screens/loan/RepaidScreen";
import RepayLoanScreen from "../screens/loan/RepayLoanScreen";
import RequestLoanScreen from "../screens/loan/RequestLoanScreen";
import SubmitLoanScreen from "../screens/loan/SubmitLoanScreen";
import SubmittedScreen from "../screens/loan/SubmittedScreen";
import UserLoansScreen from "../screens/loan/UserLoansScreen";
import Profile from "../screens/ProfileScreen";
import TabTwoScreen from "../screens/TabTwoScreen";
import {
  BottomTabParamList,
  TabFourParamList,
  TabOneParamList,
  TabThreeParamList,
  TabTwoParamList,
} from "../types";

const BottomTab = createBottomTabNavigator<BottomTabParamList>();
const getIsTabBarVisible = (
  route: RouteProp<BottomTabParamList, keyof BottomTabParamList>
) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Browse";

  const noTabRoutes = [
    "Fund",
    "Funded",
    "AddContact",
    "Added",
    "Manage",
    "ManageLoans",
    "ManageFunds",
    "Success",
    "StakeLoan",
    "Staked",
    "RequestLoan",
    "SubmitLoan",
    "Submitted",
    "RepayLoan",
    "Repaid",
  ];
  if (noTabRoutes.indexOf(routeName) > -1) {
    return false;
  }
  return true;
};

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Browse"
      screenOptions={({ route }) => ({
        tabBarVisible: getIsTabBarVisible(route),
      })}
      tabBarOptions={{
        activeTintColor: Colors[colorScheme].tint,
        style: {
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
  return (
    <MaterialIcons
      size={20}
      style={{ marginBottom: -3, paddingTop: 10 }}
      {...props}
    />
  );
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
      <BrowseTabStack.Screen
        name="Funded"
        component={FundedScreen}
        options={{
          headerTitle: "",
          headerLeft: () => null,
          ...headerStyleOptions,
        }}
      />
      <BrowseTabStack.Screen
        name="AddContact"
        component={AddContactScreen}
        options={{
          headerTitle: "",
          headerRight: ({ tintColor }) => (
            <TouchableOpacity>
              <MaterialIcons
                size={30}
                name="qr-code"
                color={tintColor!}
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          ),
          ...headerStyleOptions,
        }}
      />
      <BrowseTabStack.Screen
        name="Added"
        component={AddedScreen}
        options={{
          headerTitle: "",
          headerLeft: () => null,
          ...headerStyleOptions,
        }}
      />
      <BrowseTabStack.Screen
        name="ManageLoans"
        component={ManageLoansScreen}
        options={{
          headerTitle: "Manage Loans",
          ...headerStyleOptions,
        }}
      />
      <BrowseTabStack.Screen
        name="ManageFunds"
        component={ManageFundsScreen}
        options={{
          headerTitle: "Manage Funds",
          ...headerStyleOptions,
        }}
      />
      <BrowseTabStack.Screen
        name="Success"
        component={SuccessScreen}
        options={{
          headerTitle: "",
          ...headerStyleOptions,
        }}
      />
      <BrowseTabStack.Screen
        name="StakeLoan"
        component={StakeLoanScreen}
        options={{
          headerTitle: "Manage Loan",
          ...headerStyleOptions,
        }}
      />
      <BrowseTabStack.Screen
        name="Staked"
        component={StakedScreen}
        options={{
          headerTitle: "",
          headerLeft: () => null,
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
        component={Profile}
        options={{
          headerTitle: "Profile",
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
      <LoanTabStack.Screen
        name="Submitted"
        component={SubmittedScreen}
        options={{
          headerTitle: "",
          headerLeft: () => null,
          ...headerStyleOptions,
        }}
      />
      <LoanTabStack.Screen
        name="RepayLoan"
        component={RepayLoanScreen}
        options={{
          headerTitle: "Repay Loan",
          ...headerStyleOptions,
        }}
      />
      <LoanTabStack.Screen
        name="Repaid"
        component={RepaidScreen}
        options={{
          headerTitle: "",
          headerLeft: () => null,
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
