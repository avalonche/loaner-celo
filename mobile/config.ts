const ENV = {
    dev: {
        jsonRpc: 'https://alfajores-forno.celo-testnet.org',
        walletUrl: 'celo://wallet/dappkit',
    },
    production: {

    },
};

function getEnv() {
    // testnet for now
    return ENV['dev'];
}

export default getEnv();