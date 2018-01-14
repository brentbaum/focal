import React, {Component} from "react";
import {
  CompositeDecorator,
  Modifier,
  Editor,
  EditorState,
  RichUtils,
  KeyBindingUtil
} from "draft-js";
import {myKeyBindingFn} from "./keybindings";
import {swapBlocks} from "./utils";
import {regex} from "./regex";
const {hasCommandModifier} = KeyBindingUtil;

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  /*eslint-disable */
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
  /*eslint-enable */
}

const Link = ({decoratedText, children}) => (
  <a href={decoratedText} style={styles.link}>
    {children}
  </a>
);

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
    strategy: findRegex(regex.link),
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

export class TaskEditor extends Component {
  setDomEditorRef = ref => (this.domEditor = ref);
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
    const {onChange, editorState, markDirty} = this.props;
    return (
      <Editor
        editorState={editorState}
        onChange={onChange}
        onTab={e => this.handleTab(e)}
        handleKeyCommand={this.props.handleKeyCommand}
        handleReturn={() => {
          markDirty(true);
        }}
        handleBeforeInput={chars => {
          markDirty(true);
        }}
        onUpArrow={e => {
          if (hasCommandModifier(e)) {
            e.preventDefault();
            onChange(swapBlocks(editorState, "up"));
          }
        }}
        onDownArrow={e => {
          if (hasCommandModifier(e)) {
            e.preventDefault();
            onChange(swapBlocks(editorState, "down"));
          }
        }}
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
    color: "#168c2c"
  },
  cancelledTask: {
    ...flexAlign,
    color: "#555",
    textDecoration: "line-through"
  }
};
