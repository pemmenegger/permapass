# Decentralized Application (dapp)

This folder contains the code for the decentralized application (dapp) of the PermaPass prototype. The goal of the `dapp` is to provide a user-friendly interface for managing decentralized constrution product passports. It serves as an interface to physical components, such as QR codes and NFC chips, and blockchain-based digital identities for construction products. The `dapp` is implemented using Expo and React Native as a native Smartphone app that runs on both iOS and Android devices.

## Structure

The main files and folders in this directory are:

| Path         | Description                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ./app        | Contains the app screens that can be navigated through. The starting screen of the App is `index.tsx`. The `_layout.tsx` files define the basic layout for every screen in this subdirectory. |
| ./assets     | Contains the images, fonts, and icons used in the App.                                                                                                                                        |
| ./components | Contains the reusable components used in the App.                                                                                                                                             |
| ./context    | Contains react native context providers such as `CreationContext.tsx` and `ModalContext.tsx` to hold a global state for during runntime.                                                      |
| ./hooks      | Contains custom react native hooks used in the App.                                                                                                                                           |
| ./lib        | Contains config properties, utility functions, and the API client to communicate with the Web API.                                                                                            |
| app.json     | Configuration for the Expo app.                                                                                                                                                               |

## Running Locally

Before running the App locally make sure the `web-api` is running, a local Hardhat node is running, and the smart contracts are deployed on the local Hardhat network.

Navigate to this directory and install the Node dependencies:

```bash
npm install
```

Next, add the following environment variables to a `.env.local` file in this directory:

```bash
EXPO_PUBLIC_ENVIRONMENT="dev"
EXPO_PUBLIC_HOST=
EXPO_PUBLIC_WEB_API_URL=
EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID=
EXPO_PUBLIC_INFURA_API_KEY=
```

- Get your local IP address and set it as the value for EXPO_PUBLIC_HOST, e.g. EXPO_PUBLIC_HOST="192.168.91.91"
- Set the EXPO_PUBLIC_WEB_API_URL to the URL of the running web API using your local IP address, e.g. EXPO_PUBLIC_WEB_API_URL="http://192.168.91.91:3000"
- Get a WalletConnect Cloud Project ID by signing up at [WalletConnect](https://walletconnect.org/).
- Get an EXPO_PUBLIC_INFURA_API_KEY by signing up at [Infura](https://infura.io/).

### Starting the App on iOS

Before being able to run the App on an iOS device or simulator, make sure you have installed [Xcode](https://developer.apple.com/xcode/) and set up an iOS simulator.

#### Starting the App on an iOS Simulator

To start the App on an iOS simulator:

```bash
npm run ios
```

#### Starting the App on your iOS Device

First, make sure that your iOS device is connected to your computer by a cable. Then, start the App on your iOS device:

```bash
npm run ios:device
```

### Starting the App on Android (untested)

This project has not been tested on an Android device or simulator but it should work similarly to the iOS setup. Before being able to run the App on an Android device or simulator, make sure you have installed [Android Studio](https://developer.android.com/studio) and set up an Android simulator.

#### Starting the App on an Android Simulator

To start the App on an Android simulator:

```bash
npm run android
```

#### Starting the App on your Android Device

First, make sure that your Android device is connected to your computer by a cable. Then, start the App on your Android device:

```bash
npm run android:device
```
