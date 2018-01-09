import {decorator, TaskEditor} from "./Editor";
import {writeFile} from "./db";
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

const regex = {
  task: /(\[\]|\[(.+)\]).+$/g,
  emptyTask: /(\[\]|\[ \]).+$/g,
  completedTask: /\[√\].+$/g,
  cancelledTask: /\[X\].+$/g,
  header: /\#\s(.+)/g
};

const inBrowser = true;

const persist = editorState => {
  debugger;
  if (inBrowser) {
    writeFile(editorState)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.error(err);
      });
  } else {
    localStorage.setItem(
      "editorState",
      JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    );
  }
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

const testRegex = (regex, text) => {
  const result = regex.test(text);
  regex.lastIndex = 0;
  return result;
};

const getTaskType = row => {
  if (testRegex(regex.emptyTask, row)) return "empty";
  if (testRegex(regex.completedTask, row)) return "completed";
  if (testRegex(regex.cancelledTask, row)) return "cancelled";
  return "not-task";
};

const getTaskText = text => {
  const index = text.indexOf("] ");
  if (index > -1) {
    return text.substring(text.indexOf("] ") + 2);
  }
  return text;
};

const getTaskLists = editorState => {
  const blockMap = editorState.getCurrentContent().getBlockMap();
  const [_, sections] = blockMap
    .map(({text}, blockKey) => {
      if (testRegex(regex.task, text)) {
        const taskText = getTaskText(text);
        return {
          text: taskText,
          type: getTaskType(text),
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

const getNextTaskType = taskType =>
  ({
    empty: "completed",
    completed: "cancelled",
    cancelled: "empty",
    "not-task": "empty"
  }[taskType]);

const getTaskPrefix = type =>
  ({
    empty: "[ ] ",
    completed: "[√] ",
    cancelled: "[X] ",
    "not-task": ""
  }[type]);

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
  state = {editorState: getSavedState()};
  onChange = editorState => {
    this.setState({editorState});
  };

  getTopTask = lists => {
    if (lists.length === 0) {
      return "Get after it.";
    }
    const [head, ...rest] = lists;
    const f = head.find(task => task.type === "empty");
    return f ? f.text : this.getTopTask(rest);
  };

  /* Change text from [ ] => [√] */
  toggleTaskBlock = (editorState, blockKey) => {
    const content = editorState.getCurrentContent(),
      block = content.getBlockForKey(blockKey),
      text = block.text;
    const selection = editorState.getSelection();
    const type = getTaskType(text),
      nextType = getNextTaskType(type),
      taskText = getTaskText(text),
      prefix = getTaskPrefix(nextType),
      nextText = prefix + taskText;
    const blockSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: 0,
        focusOffset: block.text.length
      }),
      contentState = Modifier.replaceText(content, blockSelection, nextText);
    /* TODO - if last type was not-todo, then increment selection by 4 forward. */
    const stateWithToggledContent = EditorState.push(editorState, contentState),
      updatedSelection =
        type === "not-task"
          ? selection.merge({
              anchorOffset: selection.focusOffset + 4,
              focusOffset: selection.focusOffset + 4
            })
          : selection,
      updatedState = EditorState.acceptSelection(
        stateWithToggledContent,
        updatedSelection
      );
    this.onChange(updatedState);
  };
  toggleCurrentTask = editorState => {
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    this.toggleTaskBlock(editorState, blockKey);
  };

  handleKeyCommand = command => {
    const {editorState} = this.state;
    if (command === "myeditor-save") {
      perist(editorState);
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
      this.toggleCurrentTask(editorState);
    }

    return "not-handled";
  };

  render() {
    const {editorState} = this.state;
    const taskLists = getTaskLists(editorState), // []
      topTask = this.getTopTask(taskLists);
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
                  this.toggleTaskBlock(editorState, task.blockKey)
                }
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
