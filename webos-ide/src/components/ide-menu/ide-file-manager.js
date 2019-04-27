import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import Description from '@material-ui/icons/Description';


const styles = theme => ({
  root: {
    width: '100%',
    height:'100%',
    backgroundColor: "#607d8b",
    textColor: "#ffffff",
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class FileManagerView extends React.Component {
  state = {
    open: true,
    files: {},

  };

  constructor(props) {
    super(props);

    this.ws = props.ws;
  }

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  onWSMessage = (e) => {
    let d = JSON.parse(e.data)
    if(d.m == "fs_dict"){
      this.setState({files: d.d});
      console.log(this.state.files)
    }

    if(d.m == "f_idreq"){
      if(this.props.onOpenFile)
        this.props.onOpenFile(d.d.name,d.d.id)
    }
  }

  componentDidMount = () =>{
    this.ws.addEventListener('message', this.onWSMessage)

    this.ws.send(JSON.stringify(
      {
        m:'fs_dict',
        d:{}
      }
    ))

  }

  componentWillUnmount = () => {
    this.ws.removeEventListener('message', this.onWSMessage)
  }

  openFile = (pathname) => {
    this.ws.send(JSON.stringify(
      {
        m:'f_idreq',
        d:{n:pathname}
      }
    ))
  }

  renderFileListItem = (obj) => {
    let keys = Object.keys(obj)



    return (
      <React.Fragment>

      {keys.map(name => {
        return (
          <ListItem button onClick={() => {this.openFile(obj[name].path)}}>
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText inset primary={obj[name].name} />
          </ListItem>
        )
      }
      )}

      </React.Fragment>
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <List
        component="nav"
        subheader={<ListSubheader component="div">Files</ListSubheader>}
        className={classes.root}
      >
      {this.renderFileListItem(this.state.files)}
      </List>
    );
  }
}

FileManagerView.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FileManagerView);



// <ListItem button>
//   <ListItemIcon>
//     <SendIcon />
//   </ListItemIcon>
//   <ListItemText inset primary="Makefile" />
// </ListItem>
// <ListItem button>
//   <ListItemIcon>
//     <DraftsIcon />
//   </ListItemIcon>
//   <ListItemText inset primary="main.c" />
// </ListItem>
// <ListItem button onClick={this.handleClick}>
//   <ListItemIcon>
//     <InboxIcon />
//   </ListItemIcon>
//   <ListItemText inset primary="engine" />
//   {this.state.open ? <ExpandLess /> : <ExpandMore />}
// </ListItem>
// <Collapse in={this.state.open} timeout="auto" unmountOnExit>
//   <List component="div" disablePadding>
//     <ListItem button className={classes.nested}>
//       <ListItemIcon>
//         <StarBorder />
//       </ListItemIcon>
//       <ListItemText inset primary="init.c" />
//     </ListItem>
//   </List>
// </Collapse>
