//const fs = require("fs");
const fs = require("fs");

const fileName = "log";

export const writeFile = editorState => {
  const content = JSON.stringify(editorState);

  return new Promise((resolve, reject) => {
    fs.writeFile("~/.get-after-it/" + fileName, content, "utf8", function(err) {
      if (err) {
        reject(err);
        return console.log(err);
      }

      console.log("The file was saved!");
      resolve({success: true});
    });
  });
};

export const readFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("~/.get-after-it/" + fileName, "utf8", function(err, data) {
      if (err) {
        reject(err);
        return console.log(err);
      }
      resolve(data);
    });
  });
};
