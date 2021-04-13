import { AntDesign } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ContainedButton, GradientView } from "../../../components/Themed";
import Colors from "../../../constants/Colors";
import GlobalStyles from "../../../constants/GlobalStyles";
import Layout from "../../../constants/Layout";
import { TabOneParamList } from "../../../types";

export default function SuccessScreen({
  navigation,
  route,
}: StackScreenProps<TabOneParamList, "Success">) {
  const { amount, message } = route.params;
  return (
    <GradientView style={styles.container}>
      <AntDesign
        name="checkcircleo"
        size={30}
        color={Colors.light.lightGray}
        style={{ padding: 10 }}
      />
      <Text style={styles.header}>Success</Text>
      <Text style={styles.body}>
        ${amount} {message}
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
          text={"Done"}
          onPress={() => navigation.navigate("ManageFunds")}
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
