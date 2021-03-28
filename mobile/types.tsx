import { ImageSourcePropType } from "react-native";

export type RootStackParamList = {
  Root: undefined;
  Landing: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  Browse: undefined;
  Profile: undefined;
  Settings: undefined;
  Home: undefined;
};

export type TabOneParamList = {
  Browse: undefined;
};

export type TabTwoParamList = {
  Profile: undefined;
};

export type TabThreeParamList = {
  Settings: undefined;
};

export type CommunitySummary = {
  name: string,
  subtitle: string, 
  logo: ImageSourcePropType,
  image: ImageSourcePropType,
  description: string,
}
