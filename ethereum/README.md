# Ethereum

This folder contains the smart contract code for the PermaPass prototype. These contracts allow users to manage digital identities for construction products on any Ethereum Virtual Machine (EVM) network. Written in [Solidity](https://docs.soliditylang.org) and developed using [Hardhat](https://hardhat.org), the contracts can currently be deployed and evaluated only on a local Hardhat node or the public Sepolia Testnet.

## Structure

The main files and folders in this directory are:

| Path              | Description                                                                                                                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ./contracts       | Contains all smart contracts for the PermaPass application: `DIDRegistry.sol`, `NFTRegistry.sol`, and `PBTRegistry.sol` manage digital identities for construction products. `HaLoNFCMetadataRegistry.sol` links HaLo NFC chips to passport metadata URIs. |
| ./helpers         | Contains helper functions for deploying and evaluating smart contracts.                                                                                                                                                                                    |
| ./scripts         | Contains Hardhat scripts: `deploy.ts` for deploying and `evaluate.ts` for evaluating smart contracts.                                                                                                                                                      |
| ./tasks           | Contains Hardhat tasks to facilitate code reusability and readability during smart contract evaluation.                                                                                                                                                    |
| ./types           | Contains all TypeScript types used within this directory.                                                                                                                                                                                                  |
| hardhat.config.ts | Configuration for the local Hardhat node and the Sepolia Testnet.                                                                                                                                                                                          |

## Running Locally

Navigate to this directory and install the Node dependencies:

```bash
npm install
```

Next, add the following environment variables to a `.env` file in this directory:

```bash
INFURA_API_KEY=
WALLET_PRIVATE_KEY_ONE=
WALLET_PRIVATE_KEY_TWO=
WALLET_PRIVATE_KEY_THREE=
WALLET_PRIVATE_KEY_FOUR=
```

- Get an INFURA_API_KEY by signing up at [Infura](https://infura.io/).
- WALLET_PRIVATE_KEYs are from your wallet provider, such as MetaMask.

### Starting a Local Hardhat Node

To start a local Hardhat node:

```bash
npm run node
```

With the node running, you can deploy and evaluate smart contracts in a separate terminal window.

#### Deploying Smart Contracts

To deploy the smart contracts to the local Hardhat node:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

#### Running the Evaluation Script

To evaluate the smart contracts on the local Hardhat node:

```bash
npx hardhat run scripts/evaluate.ts --network localhost
```
