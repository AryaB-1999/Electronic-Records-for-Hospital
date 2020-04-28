import Web3 from 'web3'


const App = {
  start: async function() {
    if (window.ethereum) {
      // use MetaMask's provider
      App.web3 = new Web3(window.ethereum)
      window.ethereum.enable() // get permission to access accounts
    } else {
      console.warn(
        'No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live',
      )
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      App.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
    }
    const url = new URLSearchParams(window.location.search)
    console.log("i am in Login.js")
    var addr = url.get('uname')
    console.log(addr)
  }
}

export default App


