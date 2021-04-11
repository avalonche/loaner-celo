import { newKitFromWeb3 } from "@celo/contractkit";
import { MaterialIcons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import faker from "faker";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import {
  Avatar,
  Divider,
  List,
  Modal,
  Portal,
  Provider,
} from "react-native-paper";
import Web3 from "web3";
import {
  ContainedButton,
  GradientView,
  OutlinedButton,
} from "../../../components/Themed";
import config from "../../../config";
import Colors from "../../../constants/Colors";
import GlobalStyles from "../../../constants/GlobalStyles";
import Layout from "../../../constants/Layout";
import { useUserContext } from "../../../context/userContext";
import { ContactSummary, TabOneParamList } from "../../../types";
import { getCommunityContract } from "../../../utils";
import { celoWalletRequest, Transaction } from "../../../utils/celoWallet";

export default function AddContactScreen({
  route,
  navigation,
}: StackScreenProps<TabOneParamList, "AddContact">) {
  const { wallet } = useUserContext();
  const { name } = route.params;
  const [borrower, setBorrower] = useState("");
  const contacts = generateContacts();
  const [lastSelect, setLastSelect] = useState<ContactSummary>();
  const [selectedBorrower, setSelectedBorrower] = useState<ContactSummary>();
  const [visible, setVisible] = useState(false);

  const submitBorrower = (borrowerAddress: string) => {
    if (!borrowerAddress.startsWith("0x") || borrowerAddress.length !== 42) {
      return;
    }
    showModal({
      contact: borrowerAddress,
      phone: borrowerAddress,
      address: borrowerAddress,
    });
  }

  const showModal = (borrower: ContactSummary) => {
    setSelectedBorrower(borrower);
    setVisible(true);
  };
  const hideModal = () => setVisible(false);

  const addBorrower = async (borrower: ContactSummary) => {
    const web3 = new Web3(config.jsonRpc);
    const kit = newKitFromWeb3(web3);
    const communityContract = getCommunityContract(
      kit,
      config.communityAddress
    );
    const addBorrowerTxObject: Transaction = {
      from: wallet.address,
      to: communityContract.options.address,
      txObject: await communityContract.methods.addBorrower(borrower),
    };
    await celoWalletRequest([addBorrowerTxObject], "addborrower", kit);
    setBorrower("");
    setSelectedBorrower(undefined);
    setLastSelect(selectedBorrower);
    hideModal();
    navigation.navigate("Added", {...borrower, ...route.params});
  };

  return (
    <GradientView style={styles.container}>
      <Provider>
        <KeyboardAvoidingView
          style={{
            width: Layout.window.width,
            paddingHorizontal: 20,
            marginTop: GlobalStyles.consts.headerContainerHeight / 1.5,
          }}
        >
          <Portal>
            <Modal
              visible={visible}
              onDismiss={hideModal}
              contentContainerStyle={styles.modal}
            >
              <Text
                style={{
                  color: Colors.light.text,
                  ...GlobalStyles.styles.textHeader,
                }}
              >
                Add Member
              </Text>
              <Text style={{ marginVertical: 10 }}>
                Add
                <Text style={{ color: Colors.light.link }}>
                  {" "}
                  {selectedBorrower?.contact}{" "}
                </Text>
                to community
                <Text style={{ color: Colors.light.link }}> {name}</Text>?
              </Text>
              <ContainedButton
                text={"OK"}
                onPress={() => addBorrower(selectedBorrower!)}
                style={{ marginVertical: 20 }}
              />
            </Modal>
          </Portal>
          <View>
            <MaterialIcons
              name="search"
              color={Colors.light.caption}
              size={20}
              style={styles.search}
            />

            <TextInput
              style={styles.input}
              onChangeText={setBorrower}
              value={borrower}
              placeholder="Add member to community..."
              placeholderTextColor={Colors.light.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => submitBorrower(borrower)}
            />
            {borrower ? (
              <View style={styles.clear}>
                <TouchableOpacity onPress={() => setBorrower("")}>
                  <MaterialIcons
                    name="clear"
                    color={Colors.light.caption}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <ScrollView>
            {lastSelect ? (
              <List.Section>
                <List.Subheader style={styles.subheader}>Recent</List.Subheader>
                <TouchableOpacity onPress={() => showModal(lastSelect)}>
                  <List.Item
                    titleStyle={styles.phone}
                    title={lastSelect.phone}
                    descriptionStyle={styles.description}
                    description={lastSelect.contact}
                    left={() => (
                      <View style={styles.avatar}>
                        <Avatar.Text
                          style={{ backgroundColor: Colors.light.caption }}
                          color={Colors.light.tint}
                          size={35}
                          label={`${lastSelect.contact.split(" ")[0][0]}${
                            lastSelect.contact.split(" ")[1][0]
                          }`}
                        />
                      </View>
                    )}
                  />
                </TouchableOpacity>
              </List.Section>
            ) : null}
            <List.Section>
              <List.Subheader style={styles.subheader}>Contacts</List.Subheader>
              {contacts
                .filter(({ address }) =>
                  borrower ? address.toLowerCase().startsWith(borrower) : true
                )
                .map((contact, index) => (
                  <>
                    <TouchableOpacity onPress={() => showModal(contact)} 
                        key={index}>
                      <List.Item
                        titleStyle={styles.phone}
                        title={contact.phone}
                        descriptionStyle={styles.description}
                        description={contact.contact}
                        left={() => (
                          <View style={styles.avatar}>
                            <Avatar.Text
                              style={{ backgroundColor: Colors.light.caption }}
                              color={Colors.light.tint}
                              size={35}
                              label={`${contact.contact.split(" ")[0][0]}${
                                contact.contact.split(" ")[1][0]
                              }`}
                            />
                          </View>
                        )}
                      />
                    </TouchableOpacity>
                    {index !== contacts.length - 1 ? (
                      <Divider
                        style={{ backgroundColor: Colors.light.placeholder }}
                        key={`divide-${index}`}
                      />
                    ) : null}
                  </>
                ))}
            </List.Section>
          </ScrollView>
        </KeyboardAvoidingView>
      </Provider>
    </GradientView>
  );
}

const addresses = ["0xcd421b34F15802b534EC1Dc98B98Ee6CCB416114", "0x7520f8e4b33e869a23a80bd6bef44eed0d3d23fa", "0xBB80D3289e3F8Ea4f56b90Da26644276A9bA89B2"];
const generateContacts = (): ContactSummary[] => {
  faker.seed(123);
  const fakeContacts: ContactSummary[] = [];
  for (let i = 0; i < 10; i++) {
    fakeContacts.push({
      contact: `${faker.name.firstName()} ${faker.name.lastName()}`,
      phone: faker.phone.phoneNumberFormat(2),
      address: i === 0 ? addresses[0] : addresses[1],
    });
  }
  return fakeContacts;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "transparent",
    padding: 20,
  },
  modal: {
    margin: 10,
    backgroundColor: "white",
    padding: 20,
    borderRadius: GlobalStyles.consts.borderRadius,
  },
  input: {
    paddingLeft: 25,
    paddingRight: 20,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.lightGray,
    borderBottomColor: Colors.light.lightGray,
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 10 * 3,
  },
  search: {
    position: "absolute",
    alignItems: "flex-end",
    width: 20,
    height: 20,
    top: 5,
    left: 0,
  },
  clear: {
    position: "absolute",
    alignItems: "flex-end",
    width: 20,
    height: 20,
    right: 0,
    top: 5,
  },
  description: {
    color: Colors.light.darkGrey,
    ...GlobalStyles.styles.textPrimary,
  },
  subheader: {
    color: Colors.light.background,
    ...GlobalStyles.styles.secondaryHeader,
  },
  phone: {
    color: Colors.light.background,
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
});
