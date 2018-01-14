/* store.js */
import createStore from "redux-zero";

const initialState = {editorState: null, metaState: {blanks: {}}};
const store = createStore(initialState);

export default store;
