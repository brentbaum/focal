/* store.js */
import createStore from "redux-zero";
import {EditorState} from "draft-js";

const initialState = {
  editorState: EditorState.createEmpty(),
  metaState: {blanks: {}}
};
const store = createStore(initialState);

export default store;
