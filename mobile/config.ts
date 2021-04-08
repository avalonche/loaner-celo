const ENV = {
    dev: {
        jsonRpc: 'https://alfajores-forno.celo-testnet.org',
        walletUrl: 'celo://wallet/dappkit',
        communityAddress: '0x114af16428A99c63457b9D30e8794aac64a58eDD',
        poolAddress: '0xd782253b3746708569427A718cE94986f10196d3',
        loanFactoryAddress: '0xfC1F006836cbafa0Aab968767a2F21b38f59a76b',
    },
    production: {

    },
};

function getEnv() {
    // testnet for now
    return ENV['dev'];
}

export default getEnv();