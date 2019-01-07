// Allows us to use ES6 in our migrations and tests.
require('babel-register')
const HDWallet = require('truffle-hdwallet-provider');
const infuraURL = "https://rinkeby.infura.io/v3/00ae7a3c7bc04c12b87f29e9f68d620f";
const mnemonic = "cash collect soap wedding coyote faint casual payment river crime shy combine";
module.exports = {
  networks: {
    ganache: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: () => new HDWallet(mnemonic, infuraURL),
      network_id: '4',
      gas: 4500000,
      gasPrice: 10000000000,
    }
  },
  compilers: {
    solc: {
      version: "^0.4.23"
    }
  }
}
