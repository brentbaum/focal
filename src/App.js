import {decorator, TaskEditor} from "./Editor";
import {getTopTask, getTaskLists} from "./taskUtils";
import * as R from "ramda";
import {writeFile, readFile} from "./db";
import React, {Component} from "react";
import {TaskList} from "./TaskList";
import {
  convertFromRaw,
  convertToRaw,
  SelectionState,
  EditorState,
  Modifier,
  RichUtils
} from "draft-js";
import "draft-js/dist/Draft.css";
import "semantic-ui-css/semantic.min.css";
import "./App.css";
import {insertNewBlock, swapBlocks} from "./utils";

const inBrowser = !!(window && window.process && window.process.type);

const persist = editorState => {
  const stringifiedState = JSON.stringify(
    convertToRaw(editorState.getCurrentContent())
  );
  if (!inBrowser) {
    writeFile(stringifiedState)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.error(err);
      });
  } else {
    localStorage.setItem("editorState", stringifiedState);
  }
};

const hydrateState = stateStr => {
  if (stateStr) {
    const state = JSON.parse(stateStr);
    const content = convertFromRaw(state);
    return EditorState.createWithContent(content, decorator);
  }
  return EditorState.createEmpty(decorator);
};

const getSavedState = () => {
  return new Promise((resolve, reject) => {
    if (!inBrowser) {
      readFile()
        .then(result => {
          resolve(hydrateState(result));
        })
        .catch(() => {
          resolve(hydrateState());
        });
    } else {
      const state = localStorage.getItem("editorState");
      resolve(hydrateState(state));
    }
  });
};

const insertCharacter = (editorState, character) => {
  let content = editorState.getCurrentContent();

  // Retrieve the focused block
  const selection = editorState.getSelection();
  const length = selection.getStartOffset() - selection.getEndOffset();

  if (length === 0) {
    content = Modifier.insertText(content, selection, character);
  }
  let nextState = EditorState.push(editorState, content);
  nextState = EditorState.forceSelection(
    nextState,
    content.getSelectionAfter()
  );
  return nextState;
};

const toggleListState = editorState => {
  return RichUtils.toggleBlockType(editorState, "unordered-list-item");
};

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

  handleKeyCommand = command => {
    const {editorState} = this.state;
    debugger;
    if (command === "myeditor-save") {
      persist(editorState);
      return "handled";
    }
    if (command === "myeditor-bold") {
      const nextState = RichUtils.toggleInlineStyle(editorState, "BOLD");
      this.onChange(nextState);
    }
    if (command === "myeditor-entity-check") {
      const nextState = insertCharacter(editorState, " ");
      this.onChange(nextState);
    }
    if (command === "myeditor-list-toggle") {
      const nextState = toggleListState(editorState);
      this.onChange(nextState);
    }
    if (command === "myeditor-task-toggle") {
      const nextState = this.toggleCurrentTask(editorState);
      this.onChange(nextState);
    }

    if (command === "myeditor-return") {
      const insertNewTodo = R.pipe(
        insertNewBlock,
        state => insertCharacter(state, " "),
        this.toggleCurrentTask
      );
      const nextState = insertNewTodo(editorState);
      this.onChange(nextState);
    }

    return "not-handled";
  };

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
              handleKeyCommand={this.handleKeyCommand}
            />
          </div>
          <div style={{minWidth: 280, flex: 2}}>
            {taskLists.map((list, index) => (
              <TaskList
                isActive={index === 0}
                taskList={list}
                onTaskClick={task =>
                  this.onChange(
                    this.toggleTaskBlock(editorState, task.blockKey)
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
