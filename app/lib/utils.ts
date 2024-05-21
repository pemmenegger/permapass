import config from "./config";
import { Address } from "viem";
import { ArweaveURI, ArweaveURL } from "../types";

export const encodeDataCarrierURL = (metadataURI: ArweaveURI) => {
  return config.BASE_URI_SCHEME + `read?metadataURI=${metadataURI}`;
};

export const fromTxidToURI = (txid: string): ArweaveURI => `ar://${txid}`;

export const fromTxidToURL = (txid: string): ArweaveURL => `https://arweave.net/${txid}`;

export const fromURIToURL = (uri: string): ArweaveURL => `https://arweave.net/${uri.replace("ar://", "")}`;

export const fromDIDToIdentity = (did: string): Address => did.split(":")[3] as Address;
