require('dotenv').config();
const Loaner = require('./build/contracts/Loaner.json');
const Web3 = require('web3');
const ContractKit = require('@celo/contractkit');
const web3 = new Web3('https://alfajores-forno.celo-testnet.org');
const kit = ContractKit.newKitFromWeb3(web3);

async function initCommunities() {
    const loanerInstance = new kit.web3.eth.Contract(
        Loaner.abi,
        process.env.LOANER_ADDRESS,
    );
    kit.connection.addAccount(process.env.STAGING_PRIVATE_KEY);
    
    const addCommunityTxObject = await loanerInstance.methods.addCommunity(process.env.STAGING_WALLET_ADDRESS);
    let tx = await kit.sendTransactionObject(addCommunityTxObject, { from: process.env.STAGING_WALLET_ADDRESS });
    let receipt = await tx.waitReceipt();

    const addPoolTxObject = await loanerInstance.methods.addPool(receipt.events.returnValues._communityAddress, process.env.STAGING_WALLET_ADDRESS);
    let tx = await kit.sendTransactionObject(addPoolTxObject, { from: process.env.STAGING_WALLET_ADDRESS });
    let receipt = await tx.waitReceipt(); 
}

initCommunities();