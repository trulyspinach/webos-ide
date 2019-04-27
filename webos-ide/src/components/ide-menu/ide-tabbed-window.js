import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  root: {
    height:"100%",
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },


  selectedTab:{
    backgroundColor: "#263238",
  }
});

class IDETabbedWindow extends React.Component {
  state = {
    windows: [],
    value: 0,
  };

  getWindows = () => {
    let childrenDOMs = React.Children.toArray(this.props.children);

    if(childrenDOMs.length <= 0){
      this.setState({
        windows: [],
        value: 0
      });

      return;
    }

    var wins = []
    for(var cin in childrenDOMs){
      let c = childrenDOMs[cin];
      wins.push(c.props.windowTitle? c.props.windowTitle : "untitled")
    }

    this.setState({
      windows: wins,
      value: Math.min(this.state.value, wins.length)
    })
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  componentDidMount = () => {
    this.getWindows();
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    let childrenDOMs = React.Children.toArray(this.props.children);

    return (
      <div className={classes.root}>
      {this.state.windows.length > 1?
        <AppBar position="static">

          <Tabs value={value} onChange={this.handleChange}>

            {this.state.windows.map(e => {
              return <Tab label={e} classes={{selected: classes.selectedTab}} />
            })}
          </Tabs>
        </AppBar>
      : null}

        {childrenDOMs[value]}
      </div>
    );
  }
}

IDETabbedWindow.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(IDETabbedWindow);
