import React, {Component} from 'react'
import './App.css'
import Navbar  from './Navbar';
import Web3 from 'web3';
import Tether from '../truffle_abis/Tether.json'
import RWD from '../truffle_abis/RWD.json'
import DecentralBank from '../truffle_abis/DecentralBank.json'
import Main from './Main'
import ParticleSettings from './ParticleSettings'

class App extends Component {

    async UNSAFE_componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadWeb3() {
        if(window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if(window.web3) {
                window.web3 = new Web3(window.web3.currentProvider)
           } else {
                window.alert('No ethereum browser detected! You can check out MetaMask!')
            }
        }
    
    async loadBlockchainData() {
        const web3 = window.web3
        const account = await web3.eth.getAccounts()
        this.setState({account: account[0]})
        const networkId = await web3.eth.net.getId()
        
        //Load Tether Contract
        const tetherData = Tether.networks[networkId]
        if(tetherData) {
            const tether = new web3.eth.Contract(Tether.abi, tetherData.address)
            this.setState({tether})
            let tetherBalance = await tether.methods.balanceOf(this.state.account).call()
            this.setState({tetherBalance: tetherBalance.toString()})
        
        } else {
            window.alert('Error! Tether contract not deployed - no detected network!')
        }

          //Load RWD Contract
          const rwdTokenData = RWD.networks[networkId]
          if(rwdTokenData) {
              const rwd = new web3.eth.Contract(RWD.abi, rwdTokenData.address)
              this.setState({RWD})
              let rwdTokenBalance = await rwd.methods.balanceOf(this.state.account).call()
              this.setState({rwdTokenBalance: rwdTokenBalance.toString()})
              
          } else {
              window.alert('Reward token not deployed - no network')
          }

           //Load DecentralBank Contract
           const decentralBankData = DecentralBank.networks[networkId]
           if(decentralBankData) {
               const decentralBank = new web3.eth.Contract(DecentralBank.abi, decentralBankData.address)
               this.setState({decentralBank})
               let stakingBalance = await decentralBank.methods.stakingBalance(this.state.account).call()
               this.setState({stakingBalance: stakingBalance.toString()})    
           } else {
               window.alert('Decentral Bank not deployed - no network')
        }
            this.setState({loading:false})
        } 
 

        // staking function
        stakeTokens = async (amount) => {
            this.setState({ loading: true });
            await this.state.tether.methods
              .approve(this.state.decentralBank._address, amount)
              .send({ from: this.state.account });
         
            await this.state.decentralBank.methods
              .depositTokens(amount)
              .send({ from: this.state.account });
         
            console.log(this.state.tetherBalance);
            this.setState({ loading: false });
          };
           // unstaking function
           unstakeTokens = () => {
            this.setState({loading: true})
            this.state.decentralBank.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
                this.setState({loading: false})
            })
        }
    constructor(props) {
        super(props)
        this.state = {
            account: '0x0',
            tether: {},
            rwd: {},
            decentralBank: {},
            tetherBalance: '0',
            rwdBalance: '0',
            stakingBalance: '0',
            loading: true
        }
    }

    // Our React Code Goes In here
    render() {
        let content
        {this.state.loading ? content =
        <p id='loader' className='text-center' style={{margin:'30px', color:'white'}}>
            LOADING PLEASE WAIT...</p> : content = 
            <Main
        tetherBalance={this.state.tetherBalance}
        rwdBalance={this.state.rwdBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        decentralBankContract={this.decentralBank}
        />}
        return (
            <div className='App' style={{position:'relative'}}>
                <div style={{position:'absolute'}}>
                <ParticleSettings />
                </div>
                <Navbar account={this.state.account}/>
                    <div className='container-fliud mt-5'>
                        <div className='row'>
                            <main role='main' className='col-lg-12 ml-auto mr-auto' style={{maxWidth:'600px',minHeight:'100vm'}}>
                                <div>
                                     {content}
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
        )
    }
}

export default App;