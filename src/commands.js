import {RichUtils} from "draft-js";
import {insertCharacter, toggleListState, insertNewBlock} from "./utils";
import {toggleCurrentTask} from "./taskParser";
import {pipe} from "ramda";
import {persist} from "./db";

export const handleKeyCommand = (onChange, editorState, command) => {
  if (command === "myeditor-save") {
    persist(editorState);
    return "handled";
  }
  if (command === "myeditor-bold") {
    const nextState = RichUtils.toggleInlineStyle(editorState, "BOLD");
    onChange(nextState);
  }
  if (command === "myeditor-entity-check") {
    const nextState = insertCharacter(editorState, " ");
    onChange(nextState);
  }
  if (command === "myeditor-list-toggle") {
    const nextState = toggleListState(editorState);
    onChange(nextState);
  }
  if (command === "myeditor-task-toggle") {
    const nextState = toggleCurrentTask(editorState);
    onChange(nextState);
  }

  if (command === "myeditor-return") {
    const insertNewTodo = pipe(
      insertNewBlock,
      state => insertCharacter(state, " "),
      toggleCurrentTask
    );
    const nextState = insertNewTodo(editorState);
    onChange(nextState);
  }

  return "not-handled";
};
