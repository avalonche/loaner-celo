import { StackScreenProps } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native-gesture-handler";
import { TabTwoParamList } from "../types";

export default function Profile({ navigation }: StackScreenProps<TabTwoParamList, 'Profile'>) {

    return (
        <>
        <TouchableOpacity>
         Manage Communities 
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ManageLoans')}>
            Manage Loans Approvals
        </TouchableOpacity>
        </>
    )
}