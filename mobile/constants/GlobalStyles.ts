import { StyleSheet } from "react-native";
import Colors from "./Colors";

const consts = {
  borderRadius: 4,
  headerFontSize: 26,
};

export const styles = StyleSheet.create({
  textHeader: {
    fontSize: consts.headerFontSize,
    fontWeight: "bold",
  },
});

export default {
  styles,
  consts,
};
