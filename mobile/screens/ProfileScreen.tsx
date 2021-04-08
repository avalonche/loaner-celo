import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { StyleSheet } from "react-native";
import {
  ContainedButton,
  GradientView,
  OutlinedButton,
} from "../components/Themed";
import { useUserContext } from "../context/userContext";
import { TabTwoParamList } from "../types";

export default function Profile({
  navigation,
}: StackScreenProps<TabTwoParamList, "Profile">) {
  const { role } = useUserContext();
  return (
    <GradientView style={styles.container}>
      {role.isManager ? (
        <>
          <ContainedButton
            text="Manage Communities"
            onPress={() => navigation.navigate("ManageCommunities")}
          />
          <OutlinedButton
            text="Manage Loans"
            onPress={() => navigation.navigate("ManageLoans")}
            style={{ marginVertical: 20 }}
          />
        </>
      ) : null}
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
});
