# Loaner Smart Contracts

Uncollateralized lending protocol built on Celo. While collateralized lending has seen dramatic growth and use on the Ethereum blockchain, it is not capital efficient nor lending in the sense that a line of credit is extended to the borrower. It is impractical in use cases for loans such as covering a sudden medical emergency or capital to start your own business, where it unreasonable to expect overcollaterization for a loan.

At the core of extending credit is credit scores that assess the trustworthiness of a borrower to repay the loan. Many impoverised and vulnerable communities lack the credit history and credit score to take out a loan where the only source of creditworthiness is based on the trust from other members of the community. In the absence of protocols on chain to verify and compute credit scores, our solution is to delegate the credit assessment offchain to community managers, local banks or microfinancing institutions.

The high interest rates of micro credit and mico financing is often attributed to the small size of the loans in comparison to the large overhead in operating expenses. By working with organisations such as the Grameen Foundation with its partnerships with local business and microfinancing institutions, the automated nature of these smart contracts can aim to reduce operating expense and thus give better lending rates to entrepreneurs or to meet basic critical needs such as food or medicine during times of crisis.

## Architecture

The project is currently separated into two packages. `smart-contracts` contains all the Solidity code and smart contract logic. `mobile` contains the react native mobile app built with expo. 

### Smart Contracts

The core smart contracts and their functionality is listed below:

#### `Loaner.sol`

This contract allows the creation of community and community pools, but only from the admin key.

#### `Community.sol`

This contract contains the core logic for community managers, such as adding members to the community, approving loans.

#### `LoanerPool.sol`

This contains logic for the community fund and allows any to join or withdraw from the pool. Loans are also funded from this pool, as well as depositing and withdrawing idle funds to and from moola markets.

#### `LoanToken.sol`

A new loan token is created when a community member creates a loan, and the address can be submitted to the community for approval. This loan token cannot be transferred and represents the present value of the loan.

## Deployment

### Alfajores Smart Contract Testnet

To run and deploy the smart contracts on alfajores, create an `.env` file in the `smart-contracts` folder with the following addresses:

```
STAGING_WALLET_ADDRESS=0x... # Your wallet address
STAGING_PRIVATE_KEY=0x... # Your wallet private
MOOLA_ADDRESS=0x6EAE47ccEFF3c3Ac94971704ccd25C7820121483 # moola market address on alfajores
CUSD_ALFAJORES_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 # cusd address on alfajores
```

to deploy to alfajores, you will need to install the smart contract testing framework, [Truffle](https://github.com/trufflesuite/truffle) and the [yarn](https://yarnpkg.com/) package manager.

```
cd smart-contracts
yarn # install dependencies
truffle compile # compile Solidity contracts
truffle migrate --network alfajores # deploy on alfajores network
```

the migration script will allow you to be an admin that can create community and community fund pools. Using the admin keys, you can create and add managers to communities. The managers will be the ones who can add, approve and manage funds in the community. To create a community, add the address you wish to be the manager for the community and add an `.env` variable like so:

```
MANAGER_WALLET_ADDRESS=0x...
```

then you will need to run community and funds creation script. Make sure you have [node](https://nodejs.org/en/)  installed and run `index.js` to create a new community and community pool.

```
node index.js
```

This will output the addresses of the community and community pool that was created.

#### Testing

To run the tests

```
yarn test
```

### Mobile Deployments

Install the [yarn](https://yarnpkg.com/) package manager to install the dependencies for the mobile package and run the expo app. Further instructions on running applications on Expo can be found (here)[https://docs.expo.io/] It currently can not be run on iOS as it requires native modules.

```bash
cd mobile
yarn
expo start
```

Make sure you put the community, community pool and loan factory addresses inside the `config.ts` file in order to use the addresses you deployed on alfajores.

## Experience / About us

## Links

(Design board)[https://www.figma.com/file/zqQYDMcWqvkqlaHuRBBe1h/Loanr?node-id=0%3A1]
(Expo Build)[https://expo.io/@avalonche/projects/loaner]

Built for the Celo Defi Hackathon.
