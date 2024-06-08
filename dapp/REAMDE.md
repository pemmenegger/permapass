# PermaPass Testing Instructions

## Requirements

- iPhone with iOS 14.0 or later
- Apple ID

## Setup

1. Ensure your Apple ID email is authorized to test the PermaPass App (via Pascal).
2. Download and install [TestFlight](https://apps.apple.com/us/app/testflight/id899247664).
3. Download or update the PermaPass App through TestFlight.
4. Download a wallet app, such as [MetaMask](https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202).
5. Open the wallet app and create your wallet.
6. Connect to the Sepolia Test Network.

### Receiving Sepolia Tokens

- Use your wallet address to receive free Sepolia tokens from these sources:

1. Receive 0.05 Sepolia ETH from the [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia):
   - Enter your wallet address and click `Receive 0.05 Sepolia ETH`.
2. Receive 0.05 Sepolia ETH from the [Sepolia Faucet](https://www.sepoliafaucet.io/):
   - Enter your wallet address, click `Get Tokens`, and complete the passkey verification.

## Estimated Gas Fees

- NFT-based passports:
  - `187500` Sepolia Wei, i.e. `0.0000000000001875` Sepolia ETH, for the creation of a new passport
  - `43500` Sepolia Wei, i.e. `0.0000000000000435` Sepolia ETH, for the update of a passport
  - `44000` Sepolia Wei, i.e. `0.000000000000044` Sepolia ETH, for the deletion of a passport
  - reading is free and does not require a connected wallet
