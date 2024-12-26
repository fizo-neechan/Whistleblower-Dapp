require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*"
        },
        sepolia: {
            provider: () => new HDWalletProvider(
                process.env.MNEMONIC,
                `https://sepolia.infura.io/v3/${process.env.INFURA_ID}`
            ),
            network_id: 11155111,
            gas: 5500000
        }
    },
    compilers: {
        solc: {
            version: "0.8.19"
        }
    }
};