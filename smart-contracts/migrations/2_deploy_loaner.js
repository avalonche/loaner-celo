require('dotenv').config({ path: '../.env' })
const Loaner = artifacts.require('Loaner');
const CommunityFactory = artifacts.require('CommunityFactory');
const LoanerPoolFactory = artifacts.require('LoanerPoolFactory');
const LoanFactory = artifacts.require('LoanFactory');

module.exports = (deployer, network, accounts) => {
    if (network === 'alfajores') {
        const moolaAddress = process.env.MOOLA_ADDRESS;
        const cUSDAddress = process.env.CUSD_ALFAJORES_ADDRESS;
        deployer.deploy(Loaner, cUSDAddress, moolaAddress, [
            process.env.STAGING_WALLET_ADDRESS,
        ]);
        deployer.then(async () => {
            const loaner = await Loaner.deployed();
            await deployer.deploy(LoanFactory, cUSDAddress, loaner.address);
            const loanFactory = await LoanFactory.deployed();
            await deployer.deploy(LoanerPoolFactory, cUSDAddress, loaner.address, moolaAddress);
            const loanerPoolFactory = await LoanerPoolFactory.deployed();
            await deployer.deploy(CommunityFactory, cUSDAddress, loaner.address, loanFactory.address);
            const communityFactory = await CommunityFactory.deployed();
            await loaner.setCommunityFactory(communityFactory.address);
            await loaner.setLoanFactory(loanFactory.address);
            await loaner.setLoanerPoolFactory(loanerPoolFactory.address);
        });
    } else if (network === 'mainnet') {

    }
};