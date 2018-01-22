import {getDefaultKeyBinding, KeyBindingUtil} from "draft-js";
const {hasCommandModifier} = KeyBindingUtil;

let history = [];

export const myKeyBindingFn = e => {
  history.push(e.keyCode);
  history = history.length > 10 ? history.slice(1) : history;
  console.log(e);

  if (e.keyCode === 9 /* TAB key */) {
    e.preventDefault();
    return "myeditor-tab";
  }

  if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
    return "myeditor-save";
  }

  if (e.keyCode === 66 /* `B` key */ && hasCommandModifier(e)) {
    return "myeditor-bold";
  }

  if (e.keyCode === 222 /* `'` key */ && hasCommandModifier(e)) {
    return "myeditor-task-toggle";
  }

  if (e.keyCode === 76 && hasCommandModifier(e)) {
    e.preventDefault();
    return "myeditor-list-toggle";
  }

  if (e.keyCode === 13 && hasCommandModifier(e)) {
    return "myeditor-return";
  }

  if (e.keyCode === 49 && hasCommandModifier(e)) {
    return "myeditor-show-editor";
  }
  if (e.keyCode === 50 && hasCommandModifier(e)) {
    debugger;
    return "myeditor-show-tasks";
  }
  if (e.keyCode === 51 && hasCommandModifier(e)) {
    return "myeditor-show-meetings";
  }

  return getDefaultKeyBinding(e);
};
