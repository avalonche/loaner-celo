import { StyleSheet } from "react-native";
import Colors from "./Colors";

const consts = {
  borderRadius: 4,
  headerFontSize: 24,
  primaryFontSize: 12,
  primaryFontFamily: 'Roboto_400Regular',
  headerFontFamily: 'Montserrat_500Medium',
  secondaryFontFamily: 'Roboto_500Medium',
  headerContainerHeight: 120,
};

export const styles = StyleSheet.create({
  textHeader: {
    fontSize: consts.headerFontSize,
    fontFamily: consts.headerFontFamily,
    letterSpacing: 1.25,
  },
  textPrimary: {
      fontSize: consts.primaryFontSize,
      fontFamily: consts.primaryFontFamily,
  },
  secondaryHeader: {
    fontFamily: 'Roboto_500Medium',
    textTransform: 'uppercase',
  }
});

export default {
  styles,
  consts,
};
