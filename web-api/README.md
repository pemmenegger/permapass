# Web API

This folder contains the web API code for the PermaPass prototype. The web API is built using [Express.js](https://expressjs.com) and provides functionalities for the `dapp` folder that are not supported by React Native.

## Structure

The main files and folders in this directory are:

| Path         | Description                                                                               |
| ------------ | ----------------------------------------------------------------------------------------- |
| ./api        | Contains the file `index.mjs` that runs the Express.js server exposing the API endpoints. |
| evaluate.mjs | Evaluates the Web API using the Arweave Irys Node 2.                                      |
| vercel.json  | Configuration for deploying the Web API to Vercel.                                        |

## Functionalities

The Web API provides the following functionalities:

### Uploading Data to the Arweave Mainnet

We use the Irys Node 2 to upload data to the Arweave mainnet. This allows us to upload data under 100 KiB for free, with a rate limit of 600 transactions per minute. The `@irys/sdk` JavaScript package interacts with the Irys Node 2. Since this package is not compatible with React Native, the web API handles the uploads.

- [Irys Node Fees Overview](https://docs.irys.xyz/overview/fees)
- [Irys SDK Documentation](https://docs.irys.xyz/developer-docs/irys-sdk)
- [Arweave Upload Guide](https://cookbook.arweave.dev/guides/posting-transactions/irys.html)

### Reading DID Documents

To read DID documents, we use Veramo packages. The `@arx-research/libhalo` package is required to interact with HaLo NFC chips in the `dapp`. However, this package and the Veramo React Native packages are incompatible. Hence, the web API provides Veramo reading functionality.

- [Veramo Packages](https://veramo.io/docs/basics/introduction)
- [libhalo Repository](https://github.com/arx-research/libhalo)

## Running Locally

Navigate to this directory and install the Node dependencies:

```bash
npm install
```

### Starting the Web API

To start the Web API:

```bash
npm run start
```

### Running the Evaluation Script

To evaluate the Web API:

```bash
npm run evaluate
```
