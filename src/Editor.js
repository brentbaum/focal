import * as React from "react";
import {
  Modifier,
  Editor,
  EditorState,
  RichUtils,
  KeyBindingUtil
} from "draft-js";
import {myKeyBindingFn} from "./keybindings";
import {swapBlocks} from "./utils";
const {hasCommandModifier} = KeyBindingUtil;

const myBlockStyler = blanks => contentBlock => {
  const key = contentBlock.key;
  if (blanks[key]) {
    return "blank-block";
  }
};

export class TaskEditor extends React.Component {
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
    const {onChange, editorState, markDirty, blanks} = this.props;
    return (
      <Editor
        editorState={editorState}
        onChange={onChange}
        onTab={e => this.handleTab(e)}
        handleKeyCommand={this.props.handleKeyCommand}
        blockStyleFn={myBlockStyler(blanks)}
        handleReturn={() => {
          markDirty(true);
          return "not-handled";
        }}
        handleBeforeInput={chars => {
          markDirty(true);
          return "not-handled";
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
