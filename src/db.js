import {appDir, fileName, inBrowser} from "./env";
import {EditorState, convertToRaw, convertFromRaw} from "draft-js";
import {decorator} from "./decorator";

//const fs = require("fs");
const electron = window.require("electron");
const fs = electron.remote.require("fs");

export const writeFile = (content, filename) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir);
    }
    fs.writeFile(`${appDir}/${fileName}`, content, "utf8", function(err) {
      if (err) {
        reject(err);
        return console.log(err);
      }

      console.log("The file was saved!");
      resolve({success: true});
    });
  });
};

export const getLogs = () => {
  return fs.readdirSync(appDir).filter(n => n !== ".git");
};

export const readFile = filename => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${appDir}/${fileName}`, "utf8", function(err, data) {
      if (err) {
        reject(err);
        return console.log(err);
      }
      resolve(data);
    });
  });
};

export const persist = (editorState, fileName = "log") => {
  const stringifiedState = JSON.stringify(
    convertToRaw(editorState.getCurrentContent())
  );
  if (!inBrowser) {
    writeFile(stringifiedState, fileName)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.error(err);
      });
  } else {
    localStorage.setItem("editorState", stringifiedState);
  }
};

export const hydrateState = stateStr => {
  if (stateStr) {
    const state = JSON.parse(stateStr);
    const content = convertFromRaw(state);
    return EditorState.createWithContent(content, decorator());
  }
  return EditorState.createEmpty(decorator());
};

export const getSavedState = (filename = "log") => {
  return new Promise((resolve, reject) => {
    if (!inBrowser) {
      readFile(filename)
        .then(result => {
          resolve(hydrateState(result));
        })
        .catch(() => {
          resolve(hydrateState());
        });
    } else {
      const state = localStorage.getItem("editorState");
      resolve(hydrateState(state));
    }
  });
};
