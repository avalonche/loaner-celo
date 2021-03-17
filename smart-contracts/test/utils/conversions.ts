import { BigNumber } from 'ethers';

export const toCUSD = (amount: number): BigNumber => {
    const decimals = BigNumber.from(10).pow(18);
    return BigNumber.from(amount).mul(decimals);
}

export const toAPY = (apy: number): BigNumber => {
    const decimals = BigNumber.from(10).pow(2);
    return BigNumber.from(apy).mul(decimals);
}

export const toDays = (days: number): BigNumber => {
    return BigNumber.from(days).mul(24).mul(60).mul(60);
}