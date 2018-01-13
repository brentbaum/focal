import {TaskEditor} from "./Editor";
import {getTopTask, getTaskLists, toggleTaskBlock} from "./taskParser";
import {getSavedState, persist, hasChanged} from "./db";
import React, {Component} from "react";
import {TaskList} from "./TaskList";
import {EditorState, convertToRaw} from "draft-js";
import {handleKeyCommand} from "./commands";
import {getTextSelection} from "./utils";

export default class App extends Component {
  state = {editorState: EditorState.createEmpty()};
  componentWillMount() {
    getSavedState().then(state => {
      this.setState({editorState: state});
    });
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("paste", this.handlePaste);
  }
  handleCopy = e => {
    const content = this.state.editorState.getCurrentContent();
    const selection = this.state.editorState.getSelection();
    const text = getTextSelection(content, selection);
    e.clipboardData.setData("text/plain", text);

    e.preventDefault();
  };
  handlePaste = e => {
    var data = e.clipboardData.getData("text/plain");
    e.preventDefault();
  };
  onChange = editorState => {
    this.setState({editorState});
  };

  /* Change text from [ ] => [√] */

  render() {
    const {dirty, editorState} = this.state;
    const taskLists = getTaskLists(editorState), // []
      topTask = getTopTask(taskLists);
    return (
      <div className="App">
        <header className="App-header">
          <span>{topTask || "<new task>"} </span>
          {dirty && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "#777",
                borderRadius: "50%",
                width: 10,
                height: 10
              }}
            />
          )}
        </header>
        <div className="App-content">
          <div className="App-editor" style={{flex: 5}}>
            <TaskEditor
              editorState={editorState}
              onChange={editorState => {
                this.onChange(editorState);
              }}
              markDirty={dirty => this.setState({dirty})}
              handleKeyCommand={command => {
                if (command === "myeditor-save") {
                  this.setState({dirty: false});
                }
                return handleKeyCommand(this.onChange, editorState, command);
              }}
            />
          </div>
          <div style={{minWidth: 280, flex: 2}}>
            {taskLists.map((list, index) => (
              <TaskList
                isActive={index === 0}
                taskList={list}
                onTaskClick={task =>
                  this.onChange(toggleTaskBlock(editorState, task.blockKey))
                }
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
