import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import { Redirect } from 'react-router'
import {withRouter} from 'react-router-dom';

import axios from 'axios';



const styles = {
  root: {
    display:'flex',
    flexGrow: 0,
    height:48
  },

  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

class PrimaryMenuBar extends React.Component {

  state = {
    loginDialog: false,
    logined: false,
    justLogined: false,
    anchorEl: null,
  };




  render(){

    const { classes, router } = this.props;


    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit">
              webOS Code
            </Typography>
          </Toolbar>
        </AppBar>
      </div>

    );
  }
}

PrimaryMenuBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(PrimaryMenuBar));
