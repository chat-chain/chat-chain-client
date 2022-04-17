const path = require("path");
var HDWalletProvider = require(path.join(__dirname,"client/node_modules/@truffle/hdwallet-provider"));


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 7545
    },
    goerli: {
        provider: () => {
             return new HDWalletProvider('clinic item still nose aunt leader mango tray trophy fragile hero trial', 'https://goerli.infura.io/v3/8a9359a0ddd34226a522464b60d8edea')
    },
    network_id: '5', // eslint-disable-line camelcase
    gas: 4465030,
    gasPrice: 10000000000,
    },
  },
  compilers: {
    solc: {
      version: "^0.8.4",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
};
