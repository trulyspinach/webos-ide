import React, { Component, PropTypes } from 'react';

import './App.css';

import PrimaryMenuBar from './components/menubar';
import SplashScreen from './components/splash';
import IDE from './components/ide-menu/idemenu';

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router'

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';
import lightGreen from '@material-ui/core/colors/lightGreen';
import blueGrey from '@material-ui/core/colors/blueGrey';

import { withStyles } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: blueGrey,
    secondary: pink,
  },
  status: {
    danger: 'orange',
  },
});


const styles = {

  content: {
    display:'flex',
    flexGrow:1,
    overflow:"hidden"
  }
};



class App extends Component {

  state = {
    connected: false,
  }

  componentDidMount(){
      document.title = "webOS Cloud IDE"
  }


  DoSplash = () => {
    return (
        <SplashScreen ws={this.ws} onConnectRequest={(d, e) => {this.tryConnect(d, e)}}/>
    );
  }

  handleWSMessage = (message) => {
    if(!this.wsMessageCalls[message.m]) return;
    this.wsMessageCalls[message.m](message.d);
  }

  tryConnect = (d, errorCallback) => {
    this.lastConnectTry = d;

    var ws = new WebSocket(d.address);
    this.ws = ws;

    ws.onopen = (e) => {
      //Begin login process:
      ws.send(JSON.stringify(
        {
          'm':'login',
          'd':{
            'username':d.name,
            'cipher':d.cipher
          }
        }
      ))

      this.connectModalCallback = errorCallback;
    }

    ws.onclose = (e) => {
      console.log(e)
      errorCallback("Connection dropped.")
      this.setState({connected: false})

      localStorage.removeItem("last_login");
    }

    ws.addEventListener('message', (e) => {
      this.handleWSMessage(JSON.parse(e.data))
    });
  }

  onLoginMessage = (m) => {
    if(m.succeed){
      this.setState({connected: true})
      this.connectModalCallback(null)

    } else {
      this.connectModalCallback("Connection refused.")
      this.setState({connected: false})
    }
  }

  wsMessageCalls = {
    'login': this.onLoginMessage
  }

  DoIDE = () => {
    return (
        <IDE ws={this.ws}/>
    );
  }



  render() {
    const {classes} = this.props;

    var pn = this.props.location.pathname
    var n = this.props.location.pathname.substring(1);
    if(n.indexOf('/') >= 0) n = n.substring(0, n.indexOf('/'));

    if(this.state.connected && n !== 'ide') return <Redirect to="/ide"/>;
    if(!this.state.connected && n !== 'splash') return <Redirect to="/splash"/>;

    return (

      <MuiThemeProvider theme={theme}>

        <PrimaryMenuBar ws={this.ws} onLoginStateUpdated={true}/>

        <Route exact path="/" component={this.DoSplash} />
        <Route path="/splash" component={this.DoSplash} />
        <Route path="/ide" component={this.DoIDE} />

      </MuiThemeProvider>
    );
  }
}

export default withRouter(withStyles(styles)(App));
