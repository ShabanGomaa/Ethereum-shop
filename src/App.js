import { useEffect, useState } from 'react';
import './App.css';

import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3';

function App() {

  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null
  });

  const [loading, setLoading] = useState(true)

  useEffect(() => {


    const loadProvider = async () => {

      //const provider = await detectEthereumProvider();
      const provider = new Web3.providers.HttpProvider('http://localhost:7545');
      var web3Instance = new Web3(provider);

      if (provider) {
        providerChanged(provider);
        setWeb3Api({
          provider,
          web3: web3Instance
        })
      }
      else {
        window.alert("Please install Metamask wallet or any another wallet");
      }
    }
    loadProvider();
  }, [])

  // load accounts && set current account
  const [account, setAccount] = useState(null)

  useEffect(() => {
    async function onInit() {
      await window.ethereum.enable();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      console.log(account)
      setAccount(account);

      window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        console.log(accounts[0])
      });
    }

    onInit();
  })

  // load contract
  const providerChanged = (provider) => {
    window.ethereum.on("accountsChanged", _ => window.location.reload());
    window.ethereum.on("chainChanged", _ => window.location.reload());

  }

  const [contract, setContract] = useState()
  const [productsCount, setProductsCount] = useState();

  const loadContracts = async () => {
    const contractFile = await fetch('/abis/Shop.json');
    const toJson = await contractFile.json();

    // the abi
    const abi = toJson.abi;
    const networkId = await web3Api.web3.eth.net.getId();
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

  useEffect(() => {

    web3Api.web3 && loadContracts();
  }, [web3Api.web3])

  const [productInputs, setProductInputs] = useState({
    name: "", price: "", description: ""
  });

  // Add products
  const addProduct = async () => {

    if (productInputs.name && productInputs.price && productInputs.description) {
      const priceInWei = Web3.utils.toWei(productInputs.price, "ether");
      // const balance = await web3Api.web3.eth.getBalance(account)

      const addProduct = await contract.methods.createShopProduct(productInputs.name, priceInWei, productInputs.description).send({ from: account, gas: 3000000 });
      alert('Product added successfully');
      loadContracts();
    }
    else {
      window.alert("Please fill all inputs");
    }

  }

  const [productsItem, setProductsItem] = useState([])

  useEffect(() => {
    loadProducts();
  }, [productsCount])

  const loadProducts = async () => {
    for (let i = 1; i <= productsCount; i++) {
      const product = await contract.methods.shopProducts(i).call();
      setProductsItem(productsItem => [...productsItem, product]);
    }

    setLoading(false);
  }

  const buyProduct = async (id, price) => {
    console.log(`buyproduct account====${account}`);
    let res = await contract.methods.PurchasedShopProduct(id).send({ from: account, value: price, gas: 3000000 })
    console.log(res);

    alert("Buy success");

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
        <div className='row justify-content-center p-2'>
          <div className="col-3 h6">
            Current address:
          </div>
          <div className="justify-content-left">
            {account}
          </div>
        </div>
        <div className='row justify-content-center'>

          <div className="col-3 h6">
            Products count:
          </div>
          <div className="justify-content-left">
            {productsCount}
          </div>
        </div>

        <h3>Add your product</h3>
        <div className="product-inputs container">
          <div className="input-group mb-3">
            <span className="input-group-text" id="inputGroup-sizing-default">Product name</span>
            <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" onChange={e => setProductInputs({ ...productInputs, name: e.target.value })} />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Ether value</span>
            <input type="text" className="form-control" aria-label="Amount (to the nearest dollar)" onChange={e => setProductInputs({ ...productInputs, price: e.target.value })} />
            <span className='input-group-text'>Eth</span>
          </div>

          <div className="input-group">
            <span className="input-group-text">Description</span>
            <textarea className="form-control" aria-label="With textarea" onChange={e => setProductInputs({ ...productInputs, description: e.target.value })}></textarea>
          </div>

          <button type="button" className="btn btn-success p-2 m-3" onClick={addProduct}>Add Product</button>

        </div>

        <div className='product-items'>
          <h3>Products</h3>
          {loading ? <p>Loading...</p> :
            productsItem.map((item, index) => {
              return (

                <div className='container' key={item.id}>
                  <div className="card m-5" >
                    <div className="card-header">
                      Product name: {item.name}
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">Price: {Web3.utils.fromWei(item.price, "ether")} Ether</h5>
                      <p className="card-text">Description: {item.description}</p>
                      <p className="card-text">The seller address: {item.owner}</p>

                      <button type="button" className="btn btn-success p-2 m-3" onClick={() => { buyProduct(item.id, item.price) }} >Buy</button>

                    </div>
                  </div>
                </div>

              )
            })
          }

        </div>
      </div>


    </div >
  );
}

export default App;
