import React, { Component } from 'react';


import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import SplitterLayout from 'react-splitter-layout';

import lightGreen from '@material-ui/core/colors/lightGreen';
import Lorem from './Lorem';
import 'react-splitter-layout/lib/index.css';

import SplitLayout from './ide-menu-splitter/splitter-container';
import SplitLayoutVertical from './ide-menu-splitter/splitter-container-vertical';

import FileManagerView from './ide-file-manager';
import IDETabbedWindow from './ide-tabbed-window';
import IDETextEditor from './ide-text-editor';
import IDETerminalEmu from './ide-terminal';


const styles = theme => ({

  editor:{
    margin: 0,
  },

  fullWidthPanel: {
    height: '100%'
  }
});


class IDE extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      code: '// type your code...',

      codeEditorWidth: 0,
      codeEditorHeight: 0,
    }

    this.ws = props.ws;

  }
  editorDidMount(editor, monaco) {
    console.log('editorDidMount', editor);
    editor.focus();
  }

  onChange = (newValue, e) => {
    this.setState({code:newValue})
    console.log(newValue);
  }

  render(){

    const { classes } = this.props;
    const code = this.state.code;
    const options = {
      selectOnLineNumbers: true
    };
    //<IDETextEditor editorWidth={this.state.codeEditorWidth}/>

    return(
      <SplitLayout masterMin={280} slaveMin={280} onResized={(m,s) => {this.setState({codeEditorWidth:s})}}>
        <FileManagerView  ws={this.ws}/>

        <SplitLayoutVertical masterMin={500} slaveMin={200} onResized={(m,s) => {this.setState({codeEditorHeight:m})}}>
          <IDETabbedWindow>
            <IDETextEditor ws={this.ws} windowTitle="Makefile" editorWidth={this.state.codeEditorWidth} editorHeight={this.state.codeEditorHeight}/>
            <IDETextEditor ws={this.ws} windowTitle="Makefile" editorWidth={this.state.codeEditorWidth} editorHeight={this.state.codeEditorHeight}/>
          </IDETabbedWindow>
          <IDETabbedWindow>
            <IDETerminalEmu ws={this.ws} windowTitle="Terminal 1"/>
            <IDETerminalEmu ws={this.ws} windowTitle="Terminal 2"/>
          </IDETabbedWindow>
        </SplitLayoutVertical>

      </SplitLayout>
    )
  };
}

export default withStyles(styles)(IDE);

//
// <SplitLayout masterMin={280} slaveMin={400} onResized={(m,s) => {this.setState({codeEditorWidth:s})}}>
//   <FileManagerView  ws={this.ws}/>
//
//   <IDETabbedWindow>
//   <IDETextEditor ws={this.ws} windowTitle="Makefile" editorWidth={this.state.codeEditorWidth}/>
//   <IDETextEditor ws={this.ws} windowTitle="main.c" editorWidth={this.state.codeEditorWidth}/>
//   <IDETextEditor ws={this.ws} windowTitle="init.c" editorWidth={this.state.codeEditorWidth}/>
//   </IDETabbedWindow>
//
// </SplitLayout>
