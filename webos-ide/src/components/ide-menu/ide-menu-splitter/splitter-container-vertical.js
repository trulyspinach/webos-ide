import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';


const styles = theme => ({
  flexContainer: {

    display:'flex',
    flexDirection: 'column',

    height: '100%',
    flexGrow:1,
    margin:0,
    overflow: 'hidden',
  },

  '@keyframes resize-blur': {
    from: {filter: 'blur(0px)'},
    to: {filter: 'blur(3px)'}
  },

  '@keyframes resize-unblur': {
    from: {filter: 'blur(3px)'},
    to: {filter: 'blur(0px)'}
  },

  master: {
    flexGrow:"0 0 auto",
    overflow:'hidden',

    animationName: 'resize-unblur',
    animationDuration: '0.3s',
  },

  slave: {
    flexGrow:"1 1 auto",
    overflow:'hidden',

    animationName: 'resize-unblur',
    animationDuration: '0.3s',
  },

  resizing:{
    userSelect: 'none',

    overflow: 'hidden',
    animationFillMode: 'forwards',
    animationName: 'resize-blur',
    animationDuration: '0.3s',
  },

  separater:{
    backgroundColor:'#455a64',
    flexGrow:0,
    height:'5px',
    cursor: 'row-resize',

    '&:hover':{
      backgroundColor:'#90a4ae',
    }
  }
});


class SplitLayoutVertical extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      resizing : false,
      masterPercentage : 0.5,

      calculatedPosition: 0,
      calculatedSlavePosition: 0
    }
  }

  componentDidMount = () => {
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMoved);

    this.calculateMasterPosition(0);
  }

  componentWillUnmount = () => {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMoved);
  }

  onMouseDownSeparater = (e) => {
    this.setState({resizing : true});

  }

  onMouseUp = (e) =>{
    this.setState(p => (p.resizing ? { resizing: false } : null));

  }

  onMouseMoved = (e) => {
    if(!this.state.resizing) return;

    this.calculateMasterPosition(e.clientY)

  }

  calculateMasterPosition = (mousePos) => {
    if(this.containerDOM === null) return
    let cRect = this.containerDOM.getBoundingClientRect();
    let sRect = this.separaterDOM.getBoundingClientRect();

    let posStart = cRect.top;
    let posEnd = cRect.bottom;

    let percentage = (mousePos - posStart) / posEnd;
    var pos = (posEnd - posStart) * percentage;

    if(this.props.masterMin) pos = Math.max(pos, this.props.masterMin);
    if(this.props.slaveMin) pos = Math.min(pos, posEnd - this.props.slaveMin);
    // console.log(pos)

    let slavePos = posEnd - sRect.height - pos;

    if(this.props.onResized) this.props.onResized(pos, slavePos)

    this.setState({
      masterPercentage:percentage,
      calculatedPosition:pos,
      calculatedSlavePosition:slavePos
    })

  }

  render(){

    const { classes } = this.props;

    let childrenDOMs = React.Children.toArray(this.props.children);

    let addClass = this.state.resizing? " " +classes.resizing: "";

    return(
      <div
        className={classes.flexContainer}
        ref={(d) => {this.containerDOM = d}}
      >

        <div className={classes.master + addClass} style={{height:this.state.calculatedPosition}}>
          {childrenDOMs[0]}
        </div>

        <div
          className={classes.separater}
          onMouseDown={this.onMouseDownSeparater}
          ref={(d) => {this.separaterDOM = d}}
        />

        <div className={classes.slave + addClass} style={{height:this.state.calculatedSlavePosition}}>
          {childrenDOMs[1]}
        </div>

      </div>
    )
  };
}

export default withStyles(styles)(SplitLayoutVertical);
