# Decentralized Application (dapp)

This folder contains the code for the decentralized application (dapp) of the PermaPass application. The `dapp` is implemented as React Native application and provides the following functionality:

- Creating passports ()

## Usage

Make sure that the `web-api` is running before starting the `dapp`. In a local environment, the `web-api` can be started by running `npm run start` in the `web-api` folder. In a production environment, the `web-api` should be deployed to a server and the `dapp` should be configured to use the deployed `web-api` using the .env file.

1. Install the required dependencies by running `npm install`.
2. Execute one of the following commands:
   - `npm run ios`: Start the dapp on an iOS simulator.
   - `npm run ios:device`: Start the dapp on your connected iOS device.
   - `npm run android`: Start the dapp on an Android emulator.
   - `npm run android:device`: Start the dapp on your connected Android device.
