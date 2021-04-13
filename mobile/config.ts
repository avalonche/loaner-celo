const ENV = {
    dev: {
        jsonRpc: 'https://alfajores-forno.celo-testnet.org',
        walletUrl: 'celo://wallet/dappkit',
        communityAddress: '0x114af16428A99c63457b9D30e8794aac64a58eDD',
        poolAddress: '0xd782253b3746708569427A718cE94986f10196d3',
        loanFactoryAddress: '0xfC1F006836cbafa0Aab968767a2F21b38f59a76b',
        // Lucy's
        // communityAddress: '0x97Db35571d8D463BE5Fd2d780b9D9F43B6965bc8',
        // poolAddress: '0x0d1a201F2c17fe25c7A996894056F25d54DcCe1d',
        // loanFactoryAddress: '0x919411E9056C674FCDFF10671dfC5A41b5446Cb1',
    },
    production: {

    },
};

function getEnv() {
    // testnet for now
    return ENV['dev'];
}

export default getEnv();