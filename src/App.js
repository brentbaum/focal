import {decorator, TaskEditor} from "./Editor";
import React, {Component} from "react";
import {TaskList} from "./TaskList";
import "./App.css";
import {convertFromRaw, convertToRaw, EditorState} from "draft-js";
import "draft-js/dist/Draft.css";

const regex = {
  task: /(\[\]|\[(.+)\]).+$/g,
  emptyTask: /(\[\]|\[ \]).+$/g,
  completedTask: /\[√\].+$/g,
  cancelledTask: /\[X\].+$/g,
  header: /\#\s(.+)/g
};

const saveText = editorState => {
  debugger;
  localStorage.setItem(
    "editorState",
    JSON.stringify(convertToRaw(editorState.getCurrentContent()))
  );
};

const getSavedState = () => {
  const state = localStorage.getItem("editorState");
  if (state)
    return EditorState.createWithContent(
      convertFromRaw(JSON.parse(state)),
      decorator
    );
  return EditorState.createEmpty(decorator);
};

export default class App extends Component {
  state = {editorState: getSavedState()};
  onChange = editorState => {
    this.setState({editorState});
  };

  getTaskLists = editorState => {
    const blockMap = editorState.getCurrentContent().getBlockMap();
    const [_, sections] = blockMap
      .map(({text}, blockKey) => {
        if (this.testRegex(regex.task, text)) {
          const taskText = text.substring(text.indexOf("] ") + 2);
          return {
            text: taskText,
            type: this.getTaskType(text),
            task: true,
            blockKey
          };
        }
        if (text.trim() === "") {
          return {
            empty: true,
            blockKey
          };
        }
        return {
          text: regex.text,
          blockKey
        };
      })
      .reduce(
        ([count, acc], item) => {
          if (item.empty) {
            return [count + 1, acc];
          }
          const splitAcc = count > 1 ? [[]].concat(acc) : acc;
          const [head, ...rest] = splitAcc;
          if (item.task) {
            const updatedHead = head.concat([item]);
            return [0, [updatedHead, ...rest]];
          }
          return [0, splitAcc];
        },
        [0, [[]]]
      );
    return sections.filter(a => a.length > 0);
  };
  testRegex = (regex, text) => {
    const result = regex.test(text);
    regex.lastIndex = 0;
    return result;
  };

  getTaskType = row => {
    if (this.testRegex(regex.emptyTask, row)) return "empty";
    if (this.testRegex(regex.completedTask, row)) return "completed";
    if (this.testRegex(regex.cancelledTask, row)) return "cancelled";
  };

  getTopTask = lists => {
    if (lists.length === 0) {
      return "Get after it";
    }
    const f = lists[0].find(task => task.type === "empty");
    return f ? f.text : "Get after it";
  };

  render() {
    const {editorState} = this.state;
    const taskLists = this.getTaskLists(editorState), // []
      topTask = this.getTopTask(taskLists);
    return (
      <div className="App">
        <header className="App-header">
          <span>{topTask}</span>
        </header>
        <div className="App-content">
          <div className="App-editor">
            <TaskEditor
              save={() => saveText(editorState)}
              editorState={editorState}
              onChange={editorState => this.onChange(editorState)}
            />
          </div>
          <div style={{width: 300}}>
            {taskLists.map(list => <TaskList taskList={list} />)}
          </div>
        </div>
      </div>
    );
  }
}
