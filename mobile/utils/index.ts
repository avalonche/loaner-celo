import { ContractKit } from "@celo/contractkit";
import CommunityContract from "../contracts/Community.json";
import PoolContract from "../contracts/LoanerPool.json";
import LoanFactoryContract from "../contracts/LoanFactory.json";
import LoanTokenContract from "../contracts/LoanToken.json";
import { BigNumber } from "bignumber.js";

export async function getUserBalance(kit: ContractKit, address: string) {
  const stableCoin = await kit.contracts.getStableToken();
  const cUSDBalance = await stableCoin.balanceOf(address);
  return new BigNumber(cUSDBalance.toString());
}

export function getCommunityContract(
  kit: ContractKit,
  contractAddress: string
) {
  const communityContract = new kit.web3.eth.Contract(
    CommunityContract.abi as any,
    contractAddress
  );
  return communityContract;
}

export function getPoolContract(kit: ContractKit, contractAddress: string) {
  return new kit.web3.eth.Contract(PoolContract.abi as any, contractAddress);
}

export function getLoanFactoryContract(
  kit: ContractKit,
  contractAddress: string
) {
  return new kit.web3.eth.Contract(
    LoanFactoryContract.abi as any,
    contractAddress
  );
}

export function getLoanTokenContract(
  kit: ContractKit,
  contractAddress: string
) {
  return new kit.web3.eth.Contract(
    LoanTokenContract.abi as any,
    contractAddress
  );
}

export function toApy(apy: string) {
  return new BigNumber(apy).multipliedBy(new BigNumber(10).pow(2)).toString();
}

export function toTerm(term: string) {
  return new BigNumber(term).multipliedBy(24).multipliedBy(60).multipliedBy(60);
}

export function fromApy(apy: string) {
  return new BigNumber(apy).dividedBy(new BigNumber(10).pow(2)).toString();
}

export function fromTerm(term: string) {
  return new BigNumber(term)
    .dividedBy(24)
    .dividedBy(60)
    .dividedBy(60)
    .toFixed(0)
    .toString();
}

export function fromAmount(amount: string) {
  return new BigNumber(amount)
    .dividedBy(new BigNumber(10).pow(18))
    .toFixed(2)
    .toString();
}

export function fromInterest(amount: string, apy: string, term: string) {
  return new BigNumber(amount)
    .dividedBy(new BigNumber(10).pow(18))
    .multipliedBy(new BigNumber(fromTerm(term)).dividedBy(365))
    .multipliedBy(new BigNumber(fromApy(apy)).dividedBy(100))
    .toFixed(2)
    .toString();
}

export function dayDiff(start: string, term: string) {
  return new BigNumber(term)
    .minus(
      new BigNumber(new Date().getTime() / 1000).minus(new BigNumber(start))
    )
    .dividedBy(24)
    .dividedBy(60)
    .dividedBy(60)
    .toFixed(0)
    .toString();
}
