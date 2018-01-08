import {getDefaultKeyBinding, KeyBindingUtil} from "draft-js";
const {hasCommandModifier} = KeyBindingUtil;

let history = [];

export const myKeyBindingFn = e => {
  history.push(e.keyCode);
  history = history.length > 10 ? history.slice(1) : history;
  if (e.keyCode === 9) {
    e.preventDefault();
    return "myeditor-tab";
  }

  if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
    return "myeditor-save";
  }

  if (e.keyCode === 66 /* `S` key */ && hasCommandModifier(e)) {
    return "myeditor-bold";
  }

  if (e.keyCode === 222 /* `S` key */ && hasCommandModifier(e)) {
    return "myeditor-task-toggle";
  }

  if (e.keyCode === 76 && hasCommandModifier(e)) {
    e.preventDefault();
    return "myeditor-list-toggle";
  }

  if (e.keyCode === 13 && hasCommandModifier(e)) {
    return "myeditor-return";
  }

  if (e.keyCode === 32) {
    // Only run our more complex checks if the last character
    // typed is a space
    // Test the last two characters to see if they match the full unordered
    // list regex
    return "myeditor-entity-check";
  }
  return getDefaultKeyBinding(e);
};
