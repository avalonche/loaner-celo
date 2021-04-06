const ENV = {
    dev: {
        jsonRpc: 'https://alfajores-forno.celo-testnet.org',
        walletUrl: 'celo://wallet/dappkit',
        communityAddress: '0xAF2A82a87595f9586322f6F0ebc97124A32E44c6',
        poolAddress: '0x80d74E63B032cc488CFa32bc5210Ee66A0754A70',
    },
    production: {

    },
};

function getEnv() {
    // testnet for now
    return ENV['dev'];
}

export default getEnv();