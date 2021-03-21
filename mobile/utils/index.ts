import { ContractKit } from "@celo/contractkit";
import BigNumber from "bignumber.js";

export async function getUserBalance(kit: ContractKit, address: string) {
    const stableCoin = await kit.contracts.getStableToken();
    const cUSDBalance = await stableCoin.balanceOf(address);
    return new BigNumber(cUSDBalance.toString());
}