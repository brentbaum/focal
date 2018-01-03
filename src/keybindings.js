import { getDefaultKeyBinding, KeyBindingUtil } from "draft-js";
const { hasCommandModifier } = KeyBindingUtil;

export const myKeyBindingFn = e => {
  if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
    return "myeditor-save";
  }
  if (e.keyCode === 66 /* `S` key */ && hasCommandModifier(e)) {
    return "myeditor-bold";
  }
  return getDefaultKeyBinding(e);
};
