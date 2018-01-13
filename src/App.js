import {TaskEditor} from "./Editor";
import {getTopTask, getTaskLists, toggleTaskBlock} from "./taskUtils";
import {getSavedState, persist} from "./db";
import React, {Component} from "react";
import {TaskList} from "./TaskList";
import {EditorState} from "draft-js";
import {handleKeyCommand} from "./commands";

export default class App extends Component {
  state = {editorState: EditorState.createEmpty()};
  componentWillMount() {
    getSavedState().then(state => {
      this.setState({editorState: state});
    });
  }
  onChange = editorState => {
    this.setState({editorState});
  };

  /* Change text from [ ] => [√] */

  render() {
    const {editorState} = this.state;
    const taskLists = getTaskLists(editorState), // []
      topTask = getTopTask(taskLists);
    return (
      <div className="App">
        <header className="App-header">
          <span>{topTask}</span>
        </header>
        <div className="App-content">
          <div className="App-editor" style={{flex: 5}}>
            <TaskEditor
              save={() => persist(editorState)}
              editorState={editorState}
              onChange={editorState => this.onChange(editorState)}
              handleKeyCommand={command =>
                handleKeyCommand(this.onChange, editorState, command)
              }
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
