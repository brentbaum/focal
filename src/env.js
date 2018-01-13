const electron = window.require("electron");
const os = electron.remote.require("os");
export const inBrowser = !!(window && window.process && window.process.type);
export const appDir = os.homedir() + "/.get-after-it";
export const fileName = "log";
