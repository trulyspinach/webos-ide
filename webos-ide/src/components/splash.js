import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import lightGreen from '@material-ui/core/colors/lightGreen';

import SplashConnectModal from './splash-connect-modal';

// import MonacoEditor from 'react-monaco-editor';
const styles = theme => ({
  root: {
    flexGrow: 1,
    background: 'linear-gradient(0deg, #263238 30%, #607d8b 90%)',
    top:0,
    bottom:0,
    height:'100%',
    margin: 0,
    padding: "0 30px"
  },


  splash: {
    minHeight:"100%",
  },

  '@keyframes elevated': {
    from: {paddingTop:'200px'},
    to: {opacity: 1, paddingTop:'190px'}
  },

  title:{
    paddingTop: '200px',
    textAlign: 'center',
    color:'white',

    fontSize:30,

    animationName: 'elevated',
    animationDuration: '1s',
    animationDelay:'2.5s',
    animationFillMode: 'forwards',
  },

  '@keyframes appearInNowhere': {
    from: {opacity: 0, paddingTop:'80px', filter: 'blur(10px)'},
    to: {opacity: 1, paddingTop:'10px', filter: 'blur(0px)'}
  },

  subtitle:{
    paddingTop: '80px',
    textAlign: 'center',
    color:'white',
    opacity:0,

    fontSize:35,

    animationName: 'appearInNowhere',
    animationDuration: '3s',
    animationDelay:'1s',
    animationFillMode: 'forwards',
  },

  buttonContainer:{
    textAlign: 'center',
    opacity:0,

    animationName: 'buttonAppear',
    animationDuration: '1s',
    animationDelay:'3s',
    animationFillMode: 'forwards',
  },

  '@keyframes buttonAppear': {
    from: {opacity: 0,  filter: 'blur(10px)'},
    to: {opacity: 1, filter: 'blur(0px)'}
  },

  enterButton:{
    marginTop: '80px',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  }

});


class SplashScreen extends React.Component {

  state = {
    dialogOpen: true,
    dialogLoading: false,
  }

  componentDidMount = () => {
    let ll = localStorage.getItem("last_login")
    if(ll){
      this.onConnectProceed(JSON.parse(ll))
    }
  }

  onConnectProceed = (d) => {
    console.log(d)
    this.setState({
      dialogOpen: true,
      dialogLoading: true
    })

    setTimeout(() => {
      if(this.props.onConnectRequest){
        this.props.onConnectRequest(d, (error) => {
          if(error){
            alert(error)
            this.setState({
              dialogLoading: false,
            })
          } else {
            //If the login is succeed


            localStorage.setItem("last_login", JSON.stringify(d));

            this.setState({
              dialogOpen: false,
            })
          }
        })
      } else{
        this.setState({
          dialogOpen: false,
        })
      }
    }, 500)
  }

  onModalClose = () => {
    if(this.state.dialogLoading) return;
    this.setState({dialogOpen:false})
  }

  render(){

    const { classes } = this.props;

    return(
      <div className={classes.root}>

      <SplashConnectModal open={this.state.dialogOpen} loading={this.state.dialogLoading} onClose={this.onModalClose} onProceed={this.onConnectProceed}/>

      <div className={classes.splash}>
      <Typography component="h1" className={classes.title}>
        Your personal computing experience,
      </Typography>

      <Typography component="h1" className={classes.subtitle}>
        elevated.
      </Typography>


      <div className={classes.buttonContainer}>
      <Button variant="contained" color="primary" className={classes.enterButton} onClick={() => {this.setState({dialogOpen:true, dialogLoading:false})}}>
        Connect and enter
      </Button>
      </div>

      </div>
      </div>
    )
  };
}

export default withStyles(styles)(SplashScreen);
