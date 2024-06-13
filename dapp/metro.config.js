// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Polyfill crypto for React Native to ensure the Expo mobile app works with the LibHaLo library for NFC interactions.
// More details: https://github.com/arx-research/libhalo/blob/master/docs/mobile-expo.md
config.resolver.extraNodeModules = {
  ...require("expo-crypto-polyfills"),
};

// uncomment the following line to clear cached variables of .env.local
// config.resetCache = true;

module.exports = config;
