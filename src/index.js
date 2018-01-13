import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import "draft-js/dist/Draft.css";
import "semantic-ui-css/semantic.min.css";
import "./App.css";

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
