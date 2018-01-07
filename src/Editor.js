import React, {Component} from "react";
import "./App.css";
import {
  convertToRaw,
  CompositeDecorator,
  Modifier,
  Editor,
  EditorState,
  RichUtils
} from "draft-js";
import "draft-js/dist/Draft.css";
import {myKeyBindingFn} from "./keybindings";

const regex = {
  task: /(\[\]|\[(.+)\]).+$/g,
  emptyTask: /(\[\]|\[ \]).+$/g,
  completedTask: /\[√\].+$/g,
  cancelledTask: /\[X\].+$/g,
  header: /\#\s(.+)/g
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
  const {url} = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} style={styles.link}>
      {props.children}
    </a>
  );
};

const findRegex = re => (contentBlock, callback, contentState) => {
  findWithRegex(re, contentBlock, callback);
};

const TaskItem = ({contentState, decoratedText, entityKey, ...props}) => {
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

export const decorator = new CompositeDecorator([
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

export class TaskEditor extends Component {
  setDomEditorRef = ref => (this.domEditor = ref);
  handleKeyCommand = command => {
    const {editorState, onChange} = this.props;
    if (command === "myeditor-save") {
      localStorage.setItem(
        "editorState",
        JSON.stringify(convertToRaw(editorState.getCurrentContent()))
      );
      return "handled";
    }
    if (command === "myeditor-bold") {
      const nextState = RichUtils.toggleInlineStyle(editorState, "BOLD");
      this.props.onChange(nextState);
    }
    if (command === "myeditor-entity-check") {
      onChange(insertCharacter(editorState, " "));
    }
    if (command === "myeditor-list-toggle") {
      const nextState = toggleListState(editorState);
      onChange(nextState);
    }
    return "not-handled";
  };
  componentDidMount() {
    this.domEditor.focus();
  }

  handleTab = e => {
    e.preventDefault();
    const {editorState, onChange} = this.props,
      selection = editorState.getSelection(),
      entityKey = selection.getStartKey(),
      block = editorState.getCurrentContent().getBlockForKey(entityKey);

    if (block.type === "unordered-list-item") {
      return onChange(RichUtils.onTab(e, this.props.editorState, 6));
    } else {
      const newContentState = Modifier.replaceText(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        "\t"
      );
      return onChange(
        EditorState.push(editorState, newContentState, "insert-characters")
      );
    }
  };

  render() {
    const {save, onChange, editorState} = this.props;
    return (
      <Editor
        editorState={editorState}
        onChange={onChange}
        onBlur={save}
        onTab={e => this.handleTab(e)}
        handleKeyCommand={this.handleKeyCommand}
        keyBindingFn={myKeyBindingFn}
        ref={this.setDomEditorRef}
      />
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