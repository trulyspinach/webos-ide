import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import SendIcon from '@material-ui/icons/Send';
import Fade from '@material-ui/core/Fade';

import { Redirect } from 'react-router'
import {withRouter} from 'react-router-dom';

import axios from 'axios';



const styles = theme => ({
  root: {
    display:'flex',
    flexGrow: 0,
    height:48
  },

  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },

  numOfUsers: {
    marginLeft:"81%",
  },

  share: {
    marginLeft:10,
    // marginLeft:"75%",
  },

  badge: {
    backgroundColor: 'red',
    top: '50%',
    right: -16,
    // The border color match the background color.
    border: `1px solid ${
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
    }`,
  },
});

class PrimaryMenuBar extends React.Component {

  state = {
    loginDialog: false,
    logined: false,
    justLogined: false,
    anchorEl: null,
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  copyToClip = () =>{
    /* Get the text field */

    var copyText = document.getElementById("URL");
    ;
    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Alert the copied text */
    alert("Copied URL: " + copyText.value);
  }


  render(){
    const { classes, router } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontSize="10px" width="100px" color="inherit">
              webOS
            </Typography>
            <IconButton className={classes.share}
              aria-owns={open ? 'fade-menu' : undefined}
              aria-haspopup="true"
              onClick={this.handleClick}
            >
              <SendIcon />
            </IconButton>
            <Menu
                id="fade-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={this.handleClose}
                TransitionComponent={Fade}
                fontSize="10"
              >
                <MenuItem onClick={this.copyToClip}>
                <font size="3">Click to share URL: </font>
                <textarea id="URL" rows="2" cols="30" margin="6px auto" paddingLeft="2px">
                http://192.168.43.205:3000/ide/sw32rBBJcdcis2
                </textarea>

                </MenuItem>
              </Menu>
            <Typography  className={classes.numOfUsers} color="inherit">
              <Badge badgeContent={4} color="secondary" classes={{ badge: classes.badge }}>
                <AccountCircle />
              </Badge>
            </Typography >
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
