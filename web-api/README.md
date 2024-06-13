# Web API

This folder contains the web API code for the PermaPass application. The web API extends the `dapp` by providing functionality that cannot be implemented directly within the `dapp` React Native repository, such as:

### Uploading Data to the Arweave Mainnet

We use the Irys Node 2 to upload data to the Arweave mainnet. This allows us to upload data under 100 KiB for free, with a rate limit of 600 transactions per minute. The `@irys/sdk` JavaScript package interacts with the Irys Node 2. Since this package is not compatible with React Native, the web API handles the uploads.

- [Irys Node Fees Overview](https://docs.irys.xyz/overview/fees)
- [Irys SDK Documentation](https://docs.irys.xyz/developer-docs/irys-sdk)
- [Arweave Upload Guide](https://cookbook.arweave.dev/guides/posting-transactions/irys.html)

### Reading DID Documents

To read DID documents, we use Veramo packages. The `@arx-research/libhalo` package is required to interact with HaLo NFC chips in the `dapp`. However, this package and the Veramo React Native packages are incompatible. Hence, the web API provides Veramo reading functionality.

- [Veramo Packages](https://veramo.io/docs/basics/introduction)
- [libhalo Repository](https://github.com/arx-research/libhalo)

## Usage

1. Install the dependencies with `npm install`.
2. Run one of the following commands:
   - `npm run start`: Start the web API locally.
   - `npm run evaluate`: Evaluate the Arweave upload functionality.
