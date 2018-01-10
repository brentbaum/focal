//const fs = require("fs");
const electron = window.require("electron");
const fs = electron.remote.require("fs");
const os = electron.remote.require("os");
const zlib = electron.remote.require("zlib");
console.log(zlib);

const appDir = os.homedir() + "/.get-after-it";
const fileName = "log";

export const writeFile = content => {
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

export const readFile = () => {
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
