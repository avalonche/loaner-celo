import {
  Montserrat_500Medium,
  useFonts as useMontserrat,
} from "@expo-google-fonts/montserrat";
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_100Thin,
  Roboto_700Bold,
  useFonts as useRoboto,
} from "@expo-google-fonts/roboto";
import AppLoading from "expo-app-loading";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoanProvider } from "./context/loanContext";
import { UserProvider } from "./context/userContext";
import "./global";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";

// ignore warnings from polyfill modules
LogBox.ignoreLogs([
  "Warning: The provided value 'moz",
  "Warning: The provided value 'ms-stream",
]);

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  // Loading custom fonts see https://directory.now.sh/ for fonts
  const [robotoLoaded] = useRoboto({
    Roboto_100Thin,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const [montserratLoaded] = useMontserrat({
    Montserrat_500Medium,
  });

  if (!isLoadingComplete && !robotoLoaded && !montserratLoaded) {
    return <AppLoading />;
  } else {
    return (
      <SafeAreaProvider>
        <UserProvider>
          <LoanProvider>
            <Navigation colorScheme={colorScheme} />
            <StatusBar style="light" />
          </LoanProvider>
        </UserProvider>
      </SafeAreaProvider>
    );
  }
}
