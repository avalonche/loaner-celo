import { StyleSheet } from "react-native";
import Colors from "./Colors";

const consts = {
  borderRadius: 4,
  headerFontSize: 26,
  primaryFontSize: 18,
  primaryFontFamily: 'Roboto_400Regular',
  headerFontFamily: 'Montserrat_500Medium'
};

export const styles = StyleSheet.create({
  textHeader: {
    fontSize: consts.headerFontSize,
    fontFamily: consts.headerFontFamily,
  },
  textPrimary: {
      fontSize: consts.primaryFontSize,
      fontFamily: consts.primaryFontFamily,
  }
});

export default {
  styles,
  consts,
};
