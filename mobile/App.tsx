import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { useFonts as useRoboto, Roboto_400Regular } from "@expo-google-fonts/roboto";
import { useFonts as useMontserrat, Montserrat_500Medium } from "@expo-google-fonts/montserrat";
import AppLoading from "expo-app-loading";
import LandingScreen from './screens/LandingScreen';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  
  // Loading custom fonts see https://directory.now.sh/ for fonts
  const [robotoLoaded] = useRoboto({
    Roboto_400Regular,
  });

  const [montserratLoaded] = useMontserrat({
    Montserrat_500Medium,
  });

  if (!isLoadingComplete && !robotoLoaded && !montserratLoaded) {
    return <AppLoading />;
  } else {
    return (
      <SafeAreaProvider>
        <LandingScreen/>
        {/* <Navigation colorScheme={colorScheme} />
        <StatusBar /> */}
      </SafeAreaProvider>
    );
  }
}
