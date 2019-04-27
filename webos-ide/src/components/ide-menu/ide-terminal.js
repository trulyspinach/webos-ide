import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import SplitterLayout from 'react-splitter-layout';

import lightGreen from '@material-ui/core/colors/lightGreen';


const styles = theme => ({

  editor:{
    margin: 0,
    backgroundColor: '#d500f9',
    height:'100%',
  },

  progressContainer:{
    textAlign:'center',
    backgroundColor:'#263238',
    height:"100%",
    width:"100%"
  },

  progress: {
    marginTop: 40,
  },

});


class IDETerminalEmu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      connected: true,
    }

    this.ws = props.ws;
    console.log(this.ws)
  }


  componentDidMount = () =>{
  }

  componentWillUnmount = () => {

  }


  render(){

    const { classes } = this.props;
    const code = this.state.code;
    const options = {
      selectOnLineNumbers: true
    };

    const loading = (
      <div className={classes.progressContainer}>
        <CircularProgress color="secondary" className={classes.progress}/>
      </div>
    );

    const editor = (
      <div className={classes.editor}>
      </div>
    );

    return(
        this.state.connected? editor : loading
    )
  };
}

export default withStyles(styles)(IDETerminalEmu);
