import { useEffect, useState } from 'react';
import './App.css';

import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3';

function App() {

  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null
  });
  useEffect(() => {
    const loadProvider = async () => {
      //const provider = await detectEthereumProvider();
      const provider = new Web3.providers.HttpProvider('http://localhost:7545');
      var web3Instance = new Web3(provider);

      if (provider) {
        //providerChanged(provider);
        setWeb3Api({
          provider,
          web3: web3Instance
        })
        console.log(provider);
      }
      else {
        window.alert("Please install Metamask wallet or any another wallet");
      }
    }
    loadProvider();
  }, [])


  const [account, setAccount] = useState(null)
  useEffect(() => {
    const loadAccounts = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();

      setAccount(accounts[3]);
      console.log(`${account}`);
      web3Api.web3.eth.defaultAccount = account
      console.log(`web3.eth.defaultAccount===${account}`);

      // console.log(eth);
    }
    web3Api.web3 && loadAccounts();
  })

  // load contract
  const providerChanged = (provider) => {
    provider.on("accountsChanged", _ => window.location.reload());
    provider.on("chainChanged", _ => window.location.reload());

  }

  const [contract, setContract] = useState()
  const [productsCount, setProductsCount] = useState();

  useEffect(() => {
    const loadContracts = async () => {
      const contractFile = await fetch('/abis/Shop.json');
      const toJson = await contractFile.json();

      // the abi
      const abi = toJson.abi;
      const networkId = await web3Api.web3.eth.net.getId();
      console.log(`networkId=${networkId}`);

      const networkObject = toJson.networks[networkId];
      if (networkObject) {
        const contractAddress = networkObject.address;

        const deployedContract = await new web3Api.web3.eth.Contract(abi, contractAddress);
        setContract(deployedContract);

        const _productsCount = await deployedContract.methods.count().call();
        setProductsCount(_productsCount);

      }
      else {
        console.log(`Please connect your wallet with ganache`);
        window.alert(`Please connect your wallet with ganache`);
      }

    }
    web3Api.web3 && loadContracts();
  }, [web3Api.web3])

  const [productInputs, setProductInputs] = useState({
    name: "", price: "", description: ""
  });

  // Add products
  const addProduct = async () => {
    console.log(`productInputs.name=${productInputs.name}, productInputs.price=${productInputs.price}, productInputs.description=${productInputs.description}`);
    const priceInWei = Web3.utils.toWei(productInputs.price, "ether");

    if (productInputs.name && priceInWei && productInputs.description) {
      console.log(`account===in send==${account}`);

      const addProduct = await contract.methods.createShopProduct(productInputs.name, priceInWei, productInputs.description).send({ from: account });
      window.location.reload();

    }
    else {
      window.alert("Please fill all inputs");
    }

  }

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

      <div>
        <h1>
          {productsCount}
        </h1>

        <h1>Add your product</h1>
        <div className="product-inputs container">
          <div className="input-group mb-3">
            <span className="input-group-text" id="inputGroup-sizing-default">Product name</span>
            <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" onChange={e => setProductInputs({ ...productInputs, name: e.target.value })} />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Eth</span>
            <input type="text" className="form-control" aria-label="Amount (to the nearest dollar)" onChange={e => setProductInputs({ ...productInputs, price: e.target.value })} />
          </div>

          <div className="input-group">
            <span className="input-group-text">Description</span>
            <textarea className="form-control" aria-label="With textarea" onChange={e => setProductInputs({ ...productInputs, description: e.target.value })}></textarea>
          </div>

          <button type="button" className="btn btn-success p-2 m-3" onClick={addProduct}>Add Product</button>

        </div>
      </div>
    </div>
  );
}

export default App;