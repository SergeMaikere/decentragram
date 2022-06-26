import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'


class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			account: '',
			decentragram: null,
			images: [],
			loading: false
		}
	}

	async loadWeb3 () {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum);
			await window.ethereum.enable();
		}
		else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider);
		}
		else {
			window.alert('Non-Ethereum browser detected. You should consider trying Metamask !');
		}
	}

	async loadBlockchainData () {
		const web3 = window.web3;
		const accounts = await web3.eth.getAccounts();
		this.setState({account: accounts[0]});

		const networkData = await this.getNetworkData(web3);
		const decentragram = web3.eth.Contract(Decentragram.abi, networkData.address);
		this.setState( {decentragram} );
	}

	async getImageCount (contract) {
		return await contract.methods.imageCount().call()
	}

	async getNetworkData (web3) {
		const networkId = await web3.eth.net.getId();
		const networkData = Decentragram.networks[networkId];
		return networkData ? networkData : window.alert('Decentragram contract not deployed to detected network');
	}

	async componentWillMount() {
		await this.loadWeb3();
		await this.loadBlockchainData();
	}

	render() {
		return (
			<div>
			<Navbar account={this.state.account} />
			{ this.state.loading
				? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
				: <Main/>
			}
			</div>
		);
	}
}

export default App;