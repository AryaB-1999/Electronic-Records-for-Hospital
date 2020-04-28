module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545, // was 8545
      network_id: '5777', // Match any network id
      gasPrice: 0,
    },
  },
}
