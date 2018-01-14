import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import "draft-js/dist/Draft.css";
import "semantic-ui-css/semantic.min.css";
import "./App.css";
import {Provider} from "redux-zero/react";
import store from "./store";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
