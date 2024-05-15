import { api } from "./web-api";
import { nftRegistry } from "./blockchain/nftRegistry";
import { didRegistry } from "./blockchain/didRegistry";
import config from "./config";
import { PassportMetadata } from "../types";
import { pad } from "viem";
import { stringToBytes, toHex } from "viem";

export const fromArweaveTxidToPassportMetadataURL = (txid: string) => {
  return config.BASE_URI_SCHEME + `read?arweaveTxid=${txid}`;
};

export function stringToBytes32(str: string): string {
  const bytes = stringToBytes(str);
  const padded = pad(bytes, { size: 32, dir: "right" });
  return toHex(padded);
}

export const readPassportMetadata = async (arweaveTxid: string) => {
  const metadataURL = api.arweave.fromTxidToURL(arweaveTxid);
  const metadata = await api.arweave.fetchPassportMetadata(metadataURL);
  return metadata;
};

export const readPassportHistory = async (metadata: PassportMetadata) => {
  let passportURIHistory;
  switch (metadata.type) {
    case "nft":
      passportURIHistory = await nftRegistry.readNFTPassportURIHistory(metadata);
      break;
    case "did":
      passportURIHistory = await didRegistry.readDIDPassportURIHistory(metadata);
      break;
    default:
      throw new Error(`Unknown passport type: ${metadata}`);
  }

  if (!passportURIHistory || passportURIHistory.length === 0) {
    console.log("No passport URI history found.");
    return [];
  }

  const passportHistory = await Promise.all(
    passportURIHistory.map(async (passportURI) => {
      const passportURL = api.arweave.fromURIToURL(passportURI.uri as string);
      const passport = await api.arweave.fetchPassport(passportURL);
      return passport;
    })
  );

  return passportHistory;
};
