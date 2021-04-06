import { ContractKit } from "@celo/contractkit";
import CommunityContract from '../contracts/Community.json';
import PoolContract from '../contracts/LoanerPool.json';
import BigNumber from "bignumber.js";

export async function getUserBalance(kit: ContractKit, address: string) {
    const stableCoin = await kit.contracts.getStableToken();
    const cUSDBalance = await stableCoin.balanceOf(address);
    return new BigNumber(cUSDBalance.toString());
}

export function getCommunityContract(kit: ContractKit, contractAddress: string) {
    const communityContract = new kit.web3.eth.Contract(
        CommunityContract.abi as any,
        contractAddress,
    );
    return communityContract;
}

export function getPoolContract(kit: ContractKit, contractAddress: string) {
    return new kit.web3.eth.Contract(
        PoolContract.abi as any,
        contractAddress,
    )
}