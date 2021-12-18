import { useEffect, useState } from 'react';
import './App.css';

// import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3';

function App() {

  // const [web3Api, setWeb3Api] = useState({
  //   provider: null,
  //   web3: null
  // });
  // useEffect(() => {
  //   const loadProvider = async () => {
  //     const provider = await detectEthereumProvider();
  //     if (provider) {
  //       setWeb3Api({
  //         provider,
  //         web3: new Web3(provider)
  //       })
  //       console.log(provider);
  //     }
  //     else {
  //       window.alert("Please install Metamask wallet or any another wallet");
  //     }
  //   }
  //   loadProvider();
  // }, [])

  var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

  const [account, setAccount] = useState(null)
  useEffect(() => {
    const loadAccounts = async () => {

      const accounts = await web3.eth.getAccounts();
      console.log("----------------");
      console.log(accounts);
      console.log("----------------");

      // const web33 = await web3Api.web3.eth.getAccounts()
      // console.log(`${web33}`);

      // const eth = web33.eth
      // // console.log(eth);
    }
    loadAccounts();
  })

  return (
    <div className="App">
      <nav className="navbar navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand">The Ether shop</a>
          <form className="d-flex">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
      </nav>
    </div>
  );
}

export default App;
