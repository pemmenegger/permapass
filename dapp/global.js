/*
  This file provides polyfills for global objects in a React Native environment, 
  essential for the Expo app to work with the LibHaLo library used for NFC interactions.

  More info: https://github.com/arx-research/libhalo/blob/master/docs/mobile-expo.md
*/

import { Platform } from "react-native";

if (typeof global.self === "undefined") {
  global.self = global;
}

if (Platform.OS !== "web") {
  require("react-native-get-random-values");
}

global.btoa = global.btoa || require("base-64").encode;
global.atob = global.atob || require("base-64").decode;

global.Buffer = require("buffer").Buffer;

global.process = require("process");
global.process.env.NODE_ENV = __DEV__ ? "development" : "production";
global.process.version = "v9.40";

global.location = {
  protocol: "https",
};

// BigInt polyfill
BigInt.prototype.toJSON = function () {
  return this.toString();
};
