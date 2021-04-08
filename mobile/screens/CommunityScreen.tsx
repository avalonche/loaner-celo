import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Colors } from "react-native/Libraries/NewAppScreen";
import {
    ContainedButton,
    GradientView
} from "../components/Themed";
import GlobalStyles from "../constants/GlobalStyles";
import Layout from "../constants/Layout";
import { useUserContext } from "../context/userContext";
import { TabOneParamList } from "../types";

export default function CommunityScreen({
  route,
  navigation,
}: StackScreenProps<TabOneParamList, "Community">) {
  const { role } = useUserContext();
  const {
    image,
    name,
    description,
    funders,
    loansMade,
    totalValueLocked,
  } = route.params;
  function nFormatter(num: number, digits: number = 0) {
    var si = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k+" },
      { value: 1e6, symbol: "M+" },
      { value: 1e9, symbol: "B+" },
      { value: 1e12, symbol: "T+" },
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
  }
  return (
    <GradientView style={styles.container}>
      <ScrollView
        style={{
          width: Layout.window.width,
        }}
      >
        <Image
          resizeMode="cover"
          source={image}
          style={{ width: Layout.window.width, height: Layout.window.width }}
        />
      </ScrollView>
      <View style={[styles.flex, styles.content]}>
        <View style={[styles.flex, styles.contentHeader]}>
          <Text style={styles.title}>{name}</Text>
          <View
            style={[styles.row, { alignItems: "center", marginVertical: 2 }]}
          ></View>
          <TouchableOpacity>
            <Text style={styles.description}>{description}</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              paddingTop: 20,
              paddingBottom: 30,
            }}
          >
            <View style={styles.statsContainer}>
              <Text style={styles.numerText}>{nFormatter(funders)}</Text>
              <Text style={styles.labelText}>Funders</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.numerText}>{nFormatter(loansMade)}</Text>
              <Text style={styles.labelText}>Loans Made</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.numerText}>
                {nFormatter(totalValueLocked)}
              </Text>
              <Text style={styles.labelText}>TVL</Text>
            </View>
          </View>
          <ContainedButton
            text={"Fund Community"}
            onPress={() => navigation.navigate("Fund", route.params)}
          />
          {role.isManager ? (
            <ContainedButton
              text={"Manage Community"}
              style={{ marginVertical: 20 }}
            />
          ) : null}
        </View>
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
  },
  flex: {
    flex: 0,
  },
  column: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
  },
  header: {
    backgroundColor: "transparent",
    paddingHorizontal: 36,
    paddingTop: 36,
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  back: {
    width: 16 * 3,
    height: 16 * 3,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  content: {
    backgroundColor: Colors.light.tint,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  contentHeader: {
    padding: 36,
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: -18,
  },
  shadow: {
    // shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  dotsContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 36,
    right: 0,
    left: 0,
  },
  dots: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: "gray",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  description: {
    // fontSize: theme.sizes.font * 1.2,
    // lineHeight: theme.sizes.font * 2,
    // color: theme.colors.caption
  },
  numerText: {
    ...GlobalStyles.styles.secondaryHeader,
    fontSize: GlobalStyles.consts.headerFontSize,
  },
  labelText: {
    ...GlobalStyles.styles.textPrimary,
  },
  statsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
});
