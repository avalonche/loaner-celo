import { should } from 'chai';
import { Contract, ContractFactory, Signer, BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Community } from '../types/Community';
import { CommunityFactory } from '../types/CommunityFactory';
import { CUSD } from '../types/CUSD';
import { Loaner } from '../types/Loaner';
import { LoanerPool } from '../types/LoanerPool';
import { LoanerPoolFactory } from '../types/LoanerPoolFactory';
import { LoanFactory } from '../types/LoanFactory';
import { LoanToken } from '../types/LoanToken';
import { BorrowerState, ZERO_ADDRESS } from './utils/constants';
import { filterEvent } from './utils/events';
import { AccountsSigner, getRoles, getSigners, RolesAddress } from './utils/roles';
import { toAPY, toCUSD, toDays } from './utils/conversions';

const { time } = require('@openzeppelin/test-helpers');
should();

/** @test {Loaner} contract */
describe('Loaner (complete workflow)', async () => {
    let accounts: RolesAddress;
    let signers: AccountsSigner;
    // contract instances
    let loanerInstance: Loaner;
    let communityFactoryInstance: CommunityFactory;
    let cUSDInstance: CUSD;
    let loanFactoryInstance: LoanFactory;
    let poolFactoryInstance: LoanerPoolFactory;
    // contracts
    let LoanerContract: ContractFactory;
    let CommunityFactoryContract: ContractFactory;
    let CommunityContract: ContractFactory;
    let LoanTokenContract: ContractFactory;
    let LoanerPoolContract: ContractFactory;
    let PoolFactoryContract: ContractFactory;
    let LoanFactory: ContractFactory;
    let cUSDContract: ContractFactory;

    const fundCUSD = async (
        accountToFund: string,
    ): Promise<void> => {
        await cUSDInstance
            .connect(signers.admin1)
            .testFakeFundAddress(accountToFund);
    }

    const approveCUSD = async (
        accountSigner: Signer,
        spender: string,
        amount: BigNumber,
    ): Promise<void> => {
        await cUSDInstance
            .connect(accountSigner)
            .approve(spender, amount.toString());
    }

    // addCommunity
    const addCommunity = async (
        communityManager: string,
    ): Promise<Community> => {
        const rawTx = await loanerInstance
            .connect(signers.admin1)
            .addCommunity(
            communityManager,
        );
        const tx = await rawTx.wait();
        const communityAddress = filterEvent(tx, 'CommunityAdded')!.args![0];
        const instance = (await CommunityContract.attach(
            communityAddress
        )) as Contract & Community;
        return instance;
    };

    // addPool for the community
    const addPool = async (
        community: string,
        fundsManager: string,
    ): Promise<LoanerPool> => {
        const rawTx = await loanerInstance
            .connect(signers.admin1)
            .addPool(
                community,
                fundsManager,
            );
        const tx = await rawTx.wait();
        const poolAddress = filterEvent(tx, 'PoolAdded')!.args![0];
        const instance = (await LoanerPoolContract.attach(
            poolAddress,
        )) as Contract & LoanerPool;
        return instance;
    }

    // fund the pool with cUSD
    const fundPool = async (
        instance: LoanerPool,
        amount: BigNumber,
    ): Promise<void> => {
        // approve cUSD
        await fundCUSD(accounts.funder1);
        await approveCUSD(signers.funder1, instance.address, amount);
        const rawTx = await instance
            .connect(signers.funder1)
            .join(amount.toString());
        rawTx.wait();
    }

    // add borrower
    const addBorrower = async (
        instance: Community,
        borrowerAddress: string,
        communityManagerSigner: Signer,
    ): Promise<void> => {
        const rawTx = await instance
            .connect(communityManagerSigner)
            .addBorrower(borrowerAddress);
        await rawTx.wait();
    }

    // create new loan
    const createLoanToken = async (
        communityPool: string,
        amount: BigNumber,
        term: BigNumber,
        apy: BigNumber,
        borrowerSigner: Signer,
    ): Promise<LoanToken> => {
        const rawTx = await loanFactoryInstance
            .connect(borrowerSigner)
            .createLoanToken(
                communityPool,
                amount.toString(),
                term.toString(),
                apy.toString(),
            );
        const tx = await rawTx.wait();
        const loanAddress = filterEvent(tx, 'LoanTokenCreated')!.args![0];
        const instance = (await LoanTokenContract.attach(
            loanAddress
        )) as Contract & LoanToken;
        return instance;
    }

    // submit loan to community
    const submitLoan = async (
        instance: Community,
        loanAddress: string,
        borrowerSigner: Signer,
    ): Promise<void> => {
        const rawTx = await instance
            .connect(borrowerSigner)
            .submit(loanAddress);
        await rawTx.wait();
    }

    // vote approve for loan and add stake
    const approve = async (
        instance: Community,
        loanAddress: string,
        stake: BigNumber,
        communityManager: string,
        communityManagerSigner: Signer,
    ): Promise<void> => {
        // fund manager account
        await fundCUSD(communityManager);
        await approveCUSD(communityManagerSigner, instance.address, stake)
        const rawTx = await instance
            .connect(communityManagerSigner)
            .approve(loanAddress, stake.toString());
        await rawTx.wait();
    }

    // fund the loan
    const fundLoan = async (
        loanInstance: string,
        instance: LoanerPool,
        borrowerSigner: Signer,
    ): Promise<void> => {
        const rawTx = await instance
            .connect(borrowerSigner)
            .fund(loanInstance);
        await rawTx.wait();
    }

    // withdraw funds in loan
    const withdrawFunds = async (
        instance: LoanToken,
        beneficiary: string,
        borrowerSigner: Signer,
    ): Promise<void> => {
        const rawTx = await instance
            .connect(borrowerSigner)
            .withdraw(beneficiary);
        await rawTx.wait();
    }

    // repay loan
    const repayLoan = async (
        instance: LoanToken,
        poolInstance: LoanerPool,
        borrower: string,
        borrowerSigner: Signer,
    ): Promise<void> => {
        // calculate amount to repay including interest
        const debt = await instance.debt();
        await fundCUSD(borrower);
        await approveCUSD(borrowerSigner, instance.address, debt)
        const rawTx = await instance
            .connect(borrowerSigner)
            .repay(borrower, debt);
        await rawTx.wait();
        // fast forward so loan can be closed
        await time.increase(time.duration.days(365));
    }

    const closeLoan = async (
        instance: LoanToken,
    ): Promise<void> => {
        const rawTx = await instance
            .close();
        await rawTx.wait();
    }

    const reclaimFunds = async (
        instance: LoanToken,
        poolInstance: LoanerPool,
    ): Promise<void> => {
        const rawTx = await poolInstance.reclaim(instance.address);
        await rawTx.wait();
    }

    const withdrawStake = async (
        loan: string,
        community: Community,
        communityManager: string,
        communitySigner: Signer,
    ): Promise<void> => {
        const approval = await community.getApproveVote(loan, communityManager);
        const rejections = await community.getRejectVote(loan, communityManager);
        const stake = approval.isZero() ? rejections : approval;
        await community
            .connect(communitySigner)
            .withdraw(loan, stake.toString());
    }

    beforeEach(async () => {
        accounts = await getRoles();
        signers = await getSigners();
        // contracts
        LoanerContract = await ethers.getContractFactory('Loaner');
        CommunityFactoryContract = await ethers.getContractFactory('CommunityFactory');
        CommunityContract = await ethers.getContractFactory('Community');
        LoanFactory = await ethers.getContractFactory('LoanFactory');
        LoanTokenContract = await ethers.getContractFactory('LoanToken');
        LoanerPoolContract = await ethers.getContractFactory('LoanerPool');
        PoolFactoryContract = await ethers.getContractFactory('LoanerPoolFactory');
        cUSDContract = await ethers.getContractFactory('cUSD');
        // contract instance
        cUSDInstance = (await cUSDContract.deploy()) as Contract & CUSD;
        loanerInstance = (await LoanerContract.deploy(
            cUSDInstance.address,
            ZERO_ADDRESS,
            [accounts.admin1]
        )) as Contract & Loaner;
        loanFactoryInstance = (await LoanFactory.deploy(
            cUSDInstance.address,
            loanerInstance.address,
        )) as Contract & LoanFactory;
        poolFactoryInstance = (await PoolFactoryContract.deploy(
            cUSDInstance.address,
            loanerInstance.address,
            ZERO_ADDRESS,
        )) as Contract & LoanerPoolFactory;
        communityFactoryInstance = (await CommunityFactoryContract.deploy(
            cUSDInstance.address,
            loanerInstance.address,
            loanFactoryInstance.address,
        )) as Contract & CommunityFactory;
        await loanerInstance.setCommunityFactory(
            communityFactoryInstance.address,
        );
        await loanerInstance.setLoanFactory(
            loanFactoryInstance.address,
        );
        await loanerInstance.setLoanerPoolFactory(
            poolFactoryInstance.address,
        );
    });

    it('one loan from one borrower to one community', async () => {
        // community manager creates community
        const community1 = await addCommunity(
            accounts.communityManager1
        );
        // community manager creates funding pool for community
        const pool1 = await addPool(
            community1.address,
            accounts.communityManager1,
        )
        // fund pool with cUSD
        await fundPool(pool1, toCUSD(1000));
        // community manager approves borrower to lend from community pool
        await addBorrower(
            community1,
            accounts.borrower1,
            signers.communityManager1
        );
        // borrower creates a loan
        const loan1 = await createLoanToken(
            pool1.address,
            toCUSD(1000),
            toDays(365),
            toAPY(10),
            signers.borrower1,
        );
        // submit loan to community for approval by managers
        await submitLoan(community1, loan1.address, signers.borrower1);
        // approve and stake for the loan
        await approve(community1, loan1.address, toCUSD(100), accounts.communityManager1, signers.communityManager1);
        // provide funds to loan after it is approved
        await fundLoan(loan1.address, pool1, signers.borrower1);
        // borrower withdraw funds from loan for use
        await withdrawFunds(loan1, accounts.borrower1, signers.borrower1);
        // borrower repays loan
        await repayLoan(loan1, pool1, accounts.borrower1, signers.borrower1);
        // lending pool can now reclaim its funds from the loan after closing it
        await closeLoan(loan1);
        await reclaimFunds(loan1, pool1);
        // manager reclaim stake
        await withdrawStake(loan1.address, community1, accounts.communityManager1, signers.communityManager1);
    });
})