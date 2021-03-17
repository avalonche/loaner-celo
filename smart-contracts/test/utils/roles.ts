import { Signer } from 'ethers';
import { ethers } from 'hardhat';

export interface RolesAddress {
    admin1: string;
    admin2: string;
    admin3: string;
    communityManager1: string;
    communityManager2: string;
    communityManager3: string;
    borrower1: string;
    borrower2: string;
    borrower3: string;
    funder1: string;
}

export async function getRoles() {
    const accounts = await ethers.provider.listAccounts();

    const admin1 = accounts[0];
    const admin2 = accounts[1];
    const admin3 = accounts[2];
    // community managers
    const communityManager1 = accounts[3];
    const communityManager2 = accounts[4];
    const communityManager3 = accounts[5];
    // borrowers
    const borrower1 = accounts[6];
    const borrower2 = accounts[7];
    const borrower3 = accounts[8];
    // funder
    const funder1 = accounts[9];
    return {
        admin1,
        admin2,
        admin3,
        communityManager1,
        communityManager2,
        communityManager3,
        borrower1,
        borrower2,
        borrower3,
        funder1,
    }
}

export interface AccountsSigner {
    admin1: Signer;
    admin2: Signer;
    admin3: Signer;
    communityManager1: Signer;
    communityManager2: Signer;
    communityManager3: Signer;
    borrower1: Signer;
    borrower2: Signer;
    borrower3: Signer;
    funder1: Signer;
}

export async function getSigners() {
    const accounts = await ethers.getSigners();

    const admin1 = accounts[0];
    const admin2 = accounts[1];
    const admin3 = accounts[2];
    // community managers
    const communityManager1 = accounts[3];
    const communityManager2 = accounts[4];
    const communityManager3 = accounts[5];
    // borrowers
    const borrower1 = accounts[6];
    const borrower2 = accounts[7];
    const borrower3 = accounts[8];
    // funder
    const funder1 = accounts[9];
    return {
        admin1,
        admin2,
        admin3,
        communityManager1,
        communityManager2,
        communityManager3,
        borrower1,
        borrower2,
        borrower3,
        funder1,
    }
}