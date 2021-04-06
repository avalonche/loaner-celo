/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
require('ts-node/register');
require('dotenv').config({ path: '.env' })

const Kit = require('@celo/contractkit')
const path = require('path')

// Connect to the desired network
// https://rc1-forno.celo-testnet.org
// https://alfajores-forno.celo-testnet.org
const kit = Kit.newKit('https://alfajores-forno.celo-testnet.org')

async function awaitWrapper(){
    kit.addAccount(process.env.STAGING_PRIVATE_KEY);
}

awaitWrapper()

module.exports = {
    test_file_extension_regexp: /.*\.ts$/,
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!

    // The following line will put the compiled contracts and associated info at ./client/contracts
    // contracts_build_directory: path.join(__dirname, "client/contracts"),

    networks: {
        // Use the development network if you are using @celo/ganache-cli
        // https://www.npmjs.com/package/@celo/ganache-cli
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
        },

        alfajores: {
            provider: kit.web3.currentProvider,
            network_id: 44787
        },

        mainnet: {
            host: '127.0.0.1',
            port: 8545,
            network_id: 42220,
            // from: '',
            // gas: 80000000, // 8M
            gasPrice: 1000000000, // 1 gwei
        },

        // this is necessary for coverage
        coverage: {
            host: 'localhost',
            network_id: '*', // eslint-disable-line camelcase
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01,
        }
    },

    // Set default mocha options here, use special reporters etc.
    mocha: {
        timeout: 100000,
        // reporter: 'eth-gas-reporter',
        // reporterOptions: {
        //     excludeContracts: [
        //         'cUSD',
        //         'Migrations'
        //     ]
        // }
    },

    plugins: ['solidity-coverage'],

    // Configure your compilers
    compilers: {
        solc: {
            version: '0.6.10', // Fetch exact version from solc-bin (default: truffle's version)
            settings: { // See the solidity docs for advice about optimization and evmVersion
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        },
    },
};