import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import { withStyles } from '@material-ui/core/styles';
const styles = theme => ({

  progressContainer:{
    textAlign:'center',
  },

  progress: {
    marginTop: 40,
  },
});


class SplashConnectModal extends React.Component {

  state = {
    address: "ws://" + window.location.hostname +":16666"
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleClose = () => {
    if(this.props.onClose)
      this.props.onClose();
  };

  handleProceed = () => {
    if(!this.props.onProceed) return;

    this.props.onProceed({
      address: this.state.address,
      name: this.state.username,
      cipher: this.state.cipher
    })
  }

  render() {
    const { classes } = this.props;

    let formContent = (
      <React.Fragment>
      <DialogTitle id="form-dialog-title">Connect to a webOS Mainframe Computer</DialogTitle>
      <DialogContent>
        <DialogContentText>
          The next generation computing power of webOS is provided by delicated webOS Mainframe Computers. To get started, connect to a mainframe computer provided by the webOS local representative at your organization.
        </DialogContentText>
        <TextField
          autoFocus
          value={this.state.address}
          margin="dense"
          id="name"
          label="Computer Address"
          onChange={this.handleChange('address')}
          fullWidth
        />
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Username"
          onChange={this.handleChange('username')}
          fullWidth
        />
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Shared Cipher"
          onChange={this.handleChange('cipher')}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleProceed} color="primary">
          Proceed
        </Button>
      </DialogActions>
      </React.Fragment>
    );

    let loadingContent = (
      <React.Fragment>
      <DialogTitle id="form-dialog-title">Connect to a webOS Mainframe Computer</DialogTitle>
      <DialogContent>
        <DialogContentText>
          We are trying to proceed with your request.
        </DialogContentText>

        <DialogContentText>
          Please stand by..
        </DialogContentText>

        <div className={classes.progressContainer}>
          <CircularProgress color="secondary" className={classes.progress}/>
        </div>
      </DialogContent>

      </React.Fragment>
    );

    var content = this.props.loading? loadingContent : formContent;

    return (
      <div>
        <Dialog
          open={this.props.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          {content}
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(SplashConnectModal)
