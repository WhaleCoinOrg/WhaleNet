import React, {Component} from 'react'
import WhaleNetworkV2 from '../../../build/contracts/WhaleNetworkV2.json'
import WhaleRewardsV2 from '../../../build/contracts/WhaleRewardsV2.json'
import getWeb3 from '../../utils/getWeb3'
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ReactDOM from 'react-dom'
import {keystore, txutils} from 'eth-lightwallet'
import tx from 'ethereumjs-tx'
import Header from '../header.js'
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';
import RewardAlert from '../alerts/rewardAlert.js';
import Alert from '../alert.js';




const styles  = {
  root: {
    flexGrow: 1,
    marginTop: 30,
  },
  paper: {
    padding: 16,
    textAlign: 'center',
  },
};


class RewardClaimBlockCheck extends Component {
  constructor(props) {
    super(props)

    this.state = {
      whale: '',
      address: '',
      privateKey: '',
      web3: null
    }
    this.handleKeyChange = this.handleKeyChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);

    this.handleWhaleChange = this.handleWhaleChange.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3.then(results => {
      this.setState({web3: results.web3})
      // Instantiate contract once web3 provided.
    }).catch(() => {
      console.log('Error finding web3.')
    })
  }

  // on change of form values these states are updatd
  handleKeyChange(event) {
    this.setState({privateKey: event.target.value});
  }

  handleAddressChange(event) {
    this.setState({address: event.target.value});
  }

  handleWhaleChange(event) {
    this.setState({whale: event.target.value});
  }
  // on form submit this is the action called
  handleSubmit(event) {
    event.preventDefault()
    const contract = require('truffle-contract')
    const whaleNetwork = contract(WhaleNetworkV2)
    const whaleRewards = contract(WhaleRewardsV2)
    whaleRewards.setProvider(this.state.web3.currentProvider)
    whaleNetwork.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var whaleRewardsInstance
    var whaleNetworkInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      whaleRewards.deployed().then((instance) => {
        whaleRewardsInstance = instance

        // Stores a given value, 5 by default.
        return whaleRewardsInstance.getNetworkAddress()
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        console.log(result)
        whaleNetwork.at(result).then((whaleNetworkInstance) => {
          return whaleNetworkInstance.getWhaleNextBlockShared(this.state.whale)
        }).then((block) => {
          console.log(block)
          ReactDOM.render(
          <div>{<Alert result={block.toString()}/>}</div>, document.getElementById('result'));
        // Stores a given value, 5 by default


      })
      })
        })
      }

  // renders the basic form in the root tab space
  render() {
    return (
      <MuiThemeProvider>
        <div>

          <form onSubmit={this.handleSubmit}>
          <div className={this.props.classes.root}>

          <Grid container spacing={24}>

              <Grid item xs={12} >
                <TextField fullWidth label="Enter Whale Address" value={this.state.whale} onChange={this.handleWhaleChange} />

                </Grid>

              <Grid item xs={12}>
                <Button raised type="submit" color="primary">Check next block</Button>

                </Grid>
                </Grid>
                </div>
          </form>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(RewardClaimBlockCheck);