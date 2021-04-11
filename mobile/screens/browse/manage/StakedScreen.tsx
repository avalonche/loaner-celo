import { AntDesign } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ContainedButton, GradientView } from "../../../components/Themed";
import Colors from "../../../constants/Colors";
import GlobalStyles from "../../../constants/GlobalStyles";
import Layout from "../../../constants/Layout";
import { TabOneParamList } from "../../../types";

export default function StakedScreen({
  navigation,
  route,
}: StackScreenProps<TabOneParamList, "Staked">) {
  return (
    <GradientView style={styles.container}>
      <AntDesign
        name="checkcircleo"
        size={40}
        color={Colors.light.lightGray}
      />
      <Text style={styles.header}>Complete</Text>
      <Text style={styles.body}>
        The borrower will be notified of their loan status
      </Text>
      <View
        style={{
          padding: 20,
          alignItems: "stretch",
          justifyContent: "flex-start",
          width: Layout.window.width,
        }}
      >
        <ContainedButton
          text={"OK"}
          onPress={() => navigation.navigate("ManageLoans", route.params)}
          style={{ marginVertical: 20 }}
        />
      </View>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    padding: 20,
  },
  header: {
    color: Colors.light.background,
    padding: 28,
    ...GlobalStyles.styles.textHeader,
  },
  body: {
    color: Colors.light.background,
    ...GlobalStyles.styles.textPrimary,
  },
});