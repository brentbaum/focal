import {TaskEditor} from "./Editor";
import {getTopTask, getTaskLists, toggleTaskBlock} from "./taskParser";
import {getSavedState} from "./db";
import React, {Component} from "react";
import {TaskList} from "./TaskList";
import {EditorState} from "draft-js";
import {handleKeyCommand} from "./commands";
import {getTextSelection} from "./utils";
import {restoreScroll, watchScroll} from "./scroll";
import {connect} from "redux-zero/react";
import actions from "./actions";

class AppComponent extends Component {
  state = {dirty: false};
  componentWillMount() {
    getSavedState().then(state => {
      this.onChange(state);

      restoreScroll();
    });
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("paste", this.handlePaste);
  }

  componentDidMount() {
    watchScroll();
  }
  handleCopy = e => {
    const {editorState} = this.props;
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const text = getTextSelection(content, selection);
    e.clipboardData.setData("text/plain", text);

    e.preventDefault();
  };
  handlePaste = e => {
    e.preventDefault();
  };
  onChange = editorState => {
    const {taskLists, blanks, meetings} = getTaskLists(editorState), // []
      topTask = getTopTask(taskLists),
      metaState = {topTask, taskLists, blanks, meetings};
    this.props.setEditorState(editorState);
    this.props.setMetaState(metaState);
  };

  /* Change text from [ ] => [√] */

  render() {
    const {dirty, sideMenuVisible} = this.state,
      {editorState, metaState} = this.props,
      {topTask = {}, taskLists = [], blanks} = metaState;

    return (
      <div className="App">
        <header className="App-header">
          <span>{topTask ? topTask.text : "<new task>"} </span>
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
              topTask={topTask}
              blanks={blanks}
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
          {sideMenuVisible && (
            <div style={{minWidth: 300, flex: 2}}>
              {taskLists.map((list, index) => (
                <TaskList
                  topTask={topTask}
                  isActive={index === 0}
                  taskList={list}
                  onTaskClick={task =>
                    this.onChange(toggleTaskBlock(editorState, task.blockKey))
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
const mapToProps = ({editorState, metaState}) => ({editorState, metaState});
export const App = connect(mapToProps, actions)(AppComponent);
