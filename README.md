<p align="center">
  <img src="./dapp/assets/logo.png" width="auto" height="128">
</p>

<h1 align="center">PermaPass</h1>

PermaPass is a prototype application of a permanent passport system for construction products using decentralized technologies. It was developed as part of the author's Master's Thesis at the [University of Zurich](https://www.uzh.ch/en.html) in collaboration with [ETH Zurich](https://ethz.ch/en.html) in the spring semester 2024. A permanent passport consists of a physical component (QR Code or HaLo NFC chip) that links to its digital identity (Decentralized Identifier (DID), Non-Fungible Token (NFT), or Physical-Backed Token (PBT)) stored and managed by an EVM blockchain. The goal of PermaPass is to show how such a system can be implemented and to evaluate and compare the different passport solutions.

## Introduction

This repository represents the technical implementation of the PermaPass prototype. The prototype consists of a decentralized application (dApp) as a user interface allowing users to interact with a construction products' physical components (QR Code or HaLo NFC chip) and their decentralized managed digital identities (DID, NFT, or PBT)

## Repository Structure

The repository is divided into the following main directories:

| Directory                  | Description                                                                                                                                        | Technologies                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [dapp](./dapp)             | React Native Smartphone App enabling interactions with physical data carriers and their digital identities stored on an EVM-compatible blockchain. | [React Native](https://reactnative.dev) and [Expo](https://docs.expo.dev)    |
| [ethereum](./ethereum)     | Smart contract implementations of digital identities.                                                                                              | [Solidity](https://docs.soliditylang.org) and [Hardhat](https://hardhat.org) |
| [evaluation](./evaluation) | Evaluation data and plots resulted in executing evaluation scripts.                                                                                | [Python](https://vuejs.org) with [Matplotlib](https://matplotlib.org)        |
| [web-api](./web-api)       | An API that supports the `dapp` with functionalities that were required but not supported by React Native.                                         | [Express.js](https://expressjs.com)                                          |

Details on the individual components can be found in the respective `README.md` files of the corresponding directory.

## Run It Locally

Make sure you have installed the latest version of [Node.js](https://nodejs.org/) and [yarn](https://yarnpkg.com/) on your local machine. To setup and run the PermaPass prototype locally, follow these steps:

1. Web API: Start the Web API locally as described in the [web-api](./web-api) directory.
2. Ethereum: Add environment variables as described in the [ethereum](./ethereum) directory.
3. Ethereum: Run a local hardhat node as described in the [ethereum](./ethereum) directory.
4. Ethereum: Deploy all smart contracts to the local hardhat node as described in the [ethereum](./ethereum) directory.
5. Decentralized Application (dApp): Add environment variables as described in the [dapp](./dapp) directory.
6. Decentralized Application (dApp): Start the Expo app as described in the [dapp](./dapp) directory.
7. Interact with the smartphone app to create, read, update, and delete passports.
