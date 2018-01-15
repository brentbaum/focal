const electron = window.require("electron");
const os = electron.remote.require("os");
export const inBrowser = !(window && window.require);
export const appDir = os.homedir() + "/.focal";
export const fileName = "log";
