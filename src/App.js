"use strict";
import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  convertFromRaw,
  convertToRaw,
  CompositeDecorator,
  Editor,
  EditorState,
  RichUtils
} from "draft-js";
import { myKeyBindingFn } from "./keybindings";

const regex = {
  task: /(\[\]|\[(.+)\]).+/g,
  emptyTask: /(\[\]|\[ \]).+/g,
  completedTask: /\[√\].+/g,
  cancelledTask: /\[X\].+/g,
  header: /\#\s(.+)/g
};

const commands = {
  OL: "autolist-ordered",
  UL: "autolist-unordered"
};

const blockTypes = {
  UL: "unordered-list-item",
  OL: "ordered-list-item",
  TASK: "ordered-list-item",
  UNSTYLED: "unstyled"
};

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
};

const Link = props => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} style={styles.link}>
      {props.children}
    </a>
  );
};

const findRegex = re => (contentBlock, callback, contentState) => {
  findWithRegex(re, contentBlock, callback);
};

const TaskItem = ({ contentState, decoratedText, entityKey, ...props }) => {
  let style =
    {
      completed: styles.completedTask,
      cancelled: styles.cancelledTask
    }[props.type] || styles.task;
  return (
    <div {...props} style={style} data-offset-key={props.offsetKey}>
      {props.children}
    </div>
  );
};

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link
  },
  {
    strategy: findRegex(regex.completedTask),
    component: props => <TaskItem {...props} type="completed" />
  },
  {
    strategy: findRegex(regex.cancelledTask),
    component: props => <TaskItem {...props} type="cancelled" />
  },
  {
    strategy: findRegex(regex.task),
    component: props => <TaskItem {...props} type="empty" />
  }
]);

const getSavedState = () => {
  const state = localStorage.getItem("editorState");
  if (state)
    return EditorState.createWithContent(
      convertFromRaw(JSON.parse(state)),
      decorator
    );
  return EditorState.createEmpty(decorator);
};

class App extends Component {
  state = { editorState: getSavedState() };
  setDomEditorRef = ref => (this.domEditor = ref);
  onChange = editorState => {
    this.setState({ editorState });
  };
  handleKeyCommand = command => {
    if (command === "myeditor-save") {
      localStorage.setItem(
        "editorState",
        JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))
      );
      return "handled";
    }
    if (command === "myeditor-bold") {
      console.log("BOLD");
      const selection = this.state.editorState.getSelection();
      const nextState = RichUtils.toggleInlineStyle(
        this.state.editorState,
        "BOLD"
      );
      this.onChange(nextState);
    }
    return "not-handled";
  };
  componentDidMount() {
    this.domEditor.focus();
  }
  getTaskLists = () => {
    const text = this.state.editorState.getCurrentContent().getPlainText();
    console.log(text);
    const blocks = text.split("\n\n\n");
    const tasks = blocks.map(this.getTasksInBlock).filter(b => b.length > 0);
    return tasks;
  };
  getTaskType = row => {
    if (regex.emptyTask.test(row)) return "empty";
    if (regex.completedTask.test(row)) return "completed";
    if (regex.cancelledTask.test(row)) return "cancelled";
  };
  getTasksInBlock = block => {
    const rows = block.split("\n");
    return rows.reduce((acc, row) => {
      /* Need to execute a regex between each invocation. Not sure why */
      if (regex.task.test(row) === null) {
        return acc;
      }
      const text = row.substring(row.indexOf("] ") + 2),
        task = {
          text,
          type: this.getTaskType(row)
        };
      return acc.concat([task]);
    }, []);
  };

  getTopTask = lists => {
    if (lists.length === 0) {
      return "Get after it";
    }
    const f = lists[0].find(task => task.type === "empty");
    return f ? f.text : "Get after it";
  };

  render() {
    const taskLists = this.getTaskLists(), // []
      topTask = this.getTopTask(taskLists);
    return (
      <div className="App" onClick={() => this.domEditor.focus()}>
        <header className="App-header">
          <span>{topTask}</span>
        </header>
        <div className="App-content">
          <div className="App-editor">
            <Editor
              editorState={this.state.editorState}
              onChange={this.onChange}
              onBlur={this.saveText}
              onTab={e => e.preventDefault()}
              handleKeyCommand={this.handleKeyCommand}
              keyBindingFn={myKeyBindingFn}
              ref={this.setDomEditorRef}
            />
            {JSON.stringify(taskLists)}
          </div>
        </div>
      </div>
    );
  }
}

const flexAlign = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-start"
};

const styles = {
  link: {
    color: "#3b5998",
    textDecoration: "underline"
  },
  task: {
    ...flexAlign,
    color: "#277cd8"
  },
  completedTask: {
    ...flexAlign,
    color: "#23d377"
  },
  cancelledTask: {
    ...flexAlign,
    color: "#555",
    textDecoration: "line-through"
  }
};

export default App;
