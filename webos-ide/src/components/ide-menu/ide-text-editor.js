import React, { Component } from 'react';

// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as monaco from 'monaco-editor';
import MonacoEditor from 'react-monaco-editor';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import SplitterLayout from 'react-splitter-layout';

import lightGreen from '@material-ui/core/colors/lightGreen';
import Lorem from './Lorem';



const styles = theme => ({

  editor:{
    margin: 0,
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

  myCursor: {
    borderLeft: '3px solid green',
    borderRight: '3px solid green',
    width: 4,
  },

  myCursorDead: {
    borderLeft: '0px solid red',
    borderRight: '0px solid red',
    width: 4,
  },

});


class IDETextEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name : "dedddwd",
      connected: false,
      code: '// type your code...',
      cur_show: false,
      curX:0,
      curY:0
    }

    this.ws = props.ws;
    this.editing = false;
  }

  getName = () => {
    return this.state.name
  }

  onWSMessage = (e) => {
    let d = JSON.parse(e.data)
    console.log(d)
    if(d.m == "f_req"){
      if(d.d.id != this.props.fid) return;

      this.setState({connected:true, code: d.d.initc})
    }


    if(d.m == "f_obj"){
      if(d.d.id != this.props.fid) return;

      if(d.d.fm == 'edit'){
        let v = d.d.v;
        var range = new monaco.Range(v.ls, v.cs, v.le, v.ce);
        var id = { major: 1, minor: 1 };
        var text = d.d.v.t;
        var op = {identifier: id, range: range, text: text, forceMoveMarkers: false};

        this.editing = true;
        this.refs.monaco.editor.executeEdits("other", [op]);
      }

      if(d.d.fm == 'mov_cursor'){
        if(d.d.fm != 'mov_cursor') return;
        let v = d.d.v;
        this.setState({
          cur_show:true,
          curX:v.c,
          curY:v.l
        })
      }
    }
  }

  componentDidMount = () =>{
    this.ws.addEventListener('message', this.onWSMessage)
    this.ws.send(JSON.stringify(
      {
        m:'f_req',
        d:{id:this.props.fid,fsf:"sss"}
      }
    ))

  }

  componentWillUnmount = () => {
    this.ws.removeEventListener('message', this.onWSMessage)
  }

  editorDidMount = (editor, monaco) => {
    editor.focus();

    const { classes } = this.props;
// new monaco.Range(this.state.curY, this.state.curX, this.state.curY, this.state.curX)



    editor.onDidChangeCursorPosition((e) => {
      // console.log(e)
      // if(e.reason != 3) return;
      let v = {l:e.position.lineNumber,c:e.position.column}

      this.ws.send(JSON.stringify(
        {
          m:'f_obj',
          d:{fm:'mov_cursor',id:this.props.fid,v:v}
        }
      ));
    });
  }

  onChange = (newValue, e) => {
    if(this.editing){
      this.editing = false;
      this.setState({code:newValue})
      return;
    }

    this.setState({code:newValue})
    for(var i in e.changes){
      // console.log(e.changes[i])
      let range = e.changes[i].range
      let v = {
        ls:range.startLineNumber,
        le:range.endLineNumber,
        cs:range.startColumn,
        ce:range.endColumn,
        i:e.changes[i].rangeOffset,
        l:e.changes[i].rangeLength,
        t: e.changes[i].text
      }
      // console.log(v)
      this.ws.send(JSON.stringify(
        {
          m:'f_obj',
          d:{fm:'edit',id:this.props.fid,v:v}
        }
      ));
    }
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

    if(this.refs.monaco && this.state.cur_show){
      var r = new monaco.Range(this.state.curY, this.state.curX, this.state.curY, this.state.curX)
      if(this.dec){
        this.refs.monaco.editor.deltaDecorations(this.dec, []);
      }

      this.dec = this.refs.monaco.editor.deltaDecorations([], [
        { range: r, options: { className: classes.myCursor} },
      ]);
    }


    const editor = (
      <MonacoEditor
        ref="monaco"
        width={this.props.editorWidth}
        height={this.props.editorHeight}
        className={classes.editor}
        language="c"
        theme="vs-dark"
        value={code}
        options={options}
        onChange={this.onChange}
        editorDidMount={this.editorDidMount}
      />
    );




    return(
        this.state.connected? editor : loading
    )
  };
}

export default withStyles(styles)(IDETextEditor);
