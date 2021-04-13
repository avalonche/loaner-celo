import { AntDesign } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import {
  GradientView,
  OutlinedButton
} from "../components/Themed";
import Colors from "../constants/Colors";
import GlobalStyles from "../constants/GlobalStyles";
import Layout from "../constants/Layout";
import { useUserContext } from "../context/userContext";
import { CommunitySummary, TabTwoParamList } from "../types";

const communities: CommunitySummary[] = [
  {
    name: "One World Vision",
    logo: require("../assets/images/favicon.png"),
    image: require("../assets/images/temp-children.png"),
    description:
      "Finance a school and directly help 10,000+ children reach their full potention.",
    funders: 1000000,
    loansMade: 20,
    totalValueLocked: 854875,
  },
  {
    name: "Loanr",
    logo: require("../assets/images/favicon.png"),
    image: require("../assets/images/temp-children.png"),
    description:
      "Help fund loans to people around the world and receive money back from interest.",
    funders: 100000,
    loansMade: 20,
    totalValueLocked: 300002213,
  },
  {
    name: "Lorem Ipsum",
    logo: require("../assets/images/favicon.png"),
    image: require("../assets/images/temp-children.png"),
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam venenatis ipsum ut lorem sollicitudin, eget malesuada arcu auctor. Vestibulum vitae diam sed ante volutpat venenatis. Duis accumsan maximus risus, vel auctor neque laoreet et. Cras cursus volutpat ante eget efficitur. Ut mattis eu ante sit amet molestie. Donec tincidunt placerat quam et posuere. Fusce hendrerit fringilla nunc lobortis viverra. Quisque finibus lacinia justo, eget laoreet odio sagittis at. ",
    funders: 1000,
    loansMade: 20,
    totalValueLocked: 300000,
  },
];

export default function Profile({
  navigation,
}: StackScreenProps<TabTwoParamList, "Profile">) {
  const { role } = useUserContext();

  const renderCommunities = () => {
    return (
      <View style={[styles.flex, styles.column]}>
        <View style={[styles.row, styles.communitiesHeader]}>
          <Text
            style={{
              color: Colors.light.background,
              ...GlobalStyles.styles.textHeader,
            }}
          >
            Funded Communities
          </Text>
        </View>
        <View style={[styles.column]}>
          <FlatList
            horizontal
            pagingEnabled
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            snapToAlignment="center"
            style={[styles.shadow, { overflow: "visible" }]}
            data={communities}
            keyExtractor={(item) => `${item.name}`}
            renderItem={({ item, index }) => renderCommunity(item, index)}
          />
        </View>
      </View>
    );
  };

  const renderCommunity = (item: CommunitySummary, index: number) => {
    const isLastItem = index === communities.length - 1;
    return (
      <View
        style={[
          styles.flex,
          styles.column,
          styles.community,
          styles.shadow,
          index === 0 ? { marginLeft: GlobalStyles.consts.margin } : null,
          isLastItem ? { marginRight: GlobalStyles.consts.margin / 2 } : null,
        ]}
      >
        <View style={[styles.flex, styles.communityHeader]}>
          <Image style={[styles.communityImage]} source={item.image} />
          <View style={[styles.flex, styles.row, styles.communityOptions]}>
            <Image style={styles.communityLogo} source={item.logo} />
            <AntDesign
              name={index === 0 ? "star" : "staro"}
              color={Colors.light.lightGray}
              size={GlobalStyles.consts.primaryFontSize * 1.5}
            />
          </View>
        </View>
        <View
          style={[
            styles.flex,
            styles.column,
            styles.shadow,
            {
              justifyContent: "space-evenly",
              padding: GlobalStyles.consts.padding / 2,
            },
          ]}
        >
          <Text
            style={{
              fontSize: GlobalStyles.consts.primaryFontSize * 1.25,
              fontWeight: "500",
              paddingBottom: GlobalStyles.consts.padding / 4.5,
            }}
          >
            {item.name}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <GradientView style={styles.container}>
      <View
        style={{
          width: Layout.window.width,
          marginTop: GlobalStyles.consts.headerContainerHeight,
        }}
      >
        <View style={[styles.column, styles.earningInfo, styles.shadow]}>
          <Text
            style={{
              color: Colors.light.caption,
              ...GlobalStyles.styles.secondaryHeader,
            }}
          >
            Lifetime Earnings
          </Text>
          <View
            style={[
              styles.row,
              { justifyContent: "space-between", alignItems: "flex-end" },
            ]}
          >
            <Text style={GlobalStyles.styles.textHeader}>$100.23</Text>
          </View>
        </View>
        {renderCommunities()}
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
    backgroundColor: Colors.light.lightGray,
    paddingHorizontal: GlobalStyles.consts.padding,
    paddingTop: GlobalStyles.consts.padding * 1.33,
    paddingBottom: GlobalStyles.consts.padding * 0.66,
    justifyContent: "space-between",
    alignItems: "center",
  },
  earnings: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  manage: {
    alignItems: "center",
    marginTop: GlobalStyles.consts.margin / 2,
    bottom: 20,
    left: (Layout.window.width - GlobalStyles.consts.padding * 4) / 3,
    width: Layout.window.width - GlobalStyles.consts.padding * 4,
  },
  earning: {
    width: Layout.window.width - GlobalStyles.consts.padding * 2,
    height: Layout.window.width * 0.6,
    marginHorizontal: GlobalStyles.consts.margin,
    paddingHorizontal: GlobalStyles.consts.padding,
    paddingVertical: GlobalStyles.consts.padding * 0.66,
    borderRadius: GlobalStyles.consts.borderRadius * 3,
  },
  earningInfo: {
    alignItems: "center",
    borderRadius: GlobalStyles.consts.borderRadius * 3,
    paddingHorizontal: GlobalStyles.consts.padding,
    paddingVertical: GlobalStyles.consts.padding / 2,
    bottom: 20,
    left: (Layout.window.width - GlobalStyles.consts.padding * 4) / 3,
    backgroundColor: Colors.light.lightGray,
    width: Layout.window.width - GlobalStyles.consts.padding * 4,
  },
  communitiesHeader: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: GlobalStyles.consts.padding,
  },
  community: {
    width: (Layout.window.width - GlobalStyles.consts.padding * 2) / 2,
    marginHorizontal: 8,
    backgroundColor: Colors.light.lightGray,
    overflow: "hidden",
    borderRadius: GlobalStyles.consts.borderRadius * 3,
    marginVertical: GlobalStyles.consts.margin * 0.5,
  },
  communityHeader: {
    overflow: "hidden",
    borderTopRightRadius: GlobalStyles.consts.borderRadius * 3,
    borderTopLeftRadius: GlobalStyles.consts.borderRadius * 3,
  },
  communityOptions: {
    alignItems: "center",
    justifyContent: "space-between",
    padding: GlobalStyles.consts.padding / 2,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  communityLogo: {
    width: 20,
    height: 20,
  },
  communityImage: {
    width: (Layout.window.width - GlobalStyles.consts.padding * 2) / 2,
    height: (Layout.window.width - GlobalStyles.consts.padding * 2) / 2,
  },
  shadow: {
    shadowColor: Colors.light.text,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
});
