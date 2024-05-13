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
  console.log("readPassportMetadata - metadata", metadata);
  console.log(`typeof metadata: ${typeof metadata}`);

  return metadata;
};

export const readPassport = async (metadata: PassportMetadata) => {
  let passportURI;
  switch (metadata.type) {
    case "nft":
      passportURI = await nftRegistry.readNFTPassportURI(metadata);
      break;
    case "did":
      passportURI = await didRegistry.readDIDPassportURI(metadata);
      break;
    default:
      throw new Error(`Unknown passport type: ${metadata}`);
  }
  const passportURL = api.arweave.fromURIToURL(passportURI as string);
  const passport = await api.arweave.fetchPassport(passportURL);
  return passport;
};

export const readPassportFromMetadataTxid = async (metadataTxid: string) => {
  const metadata = await readPassportMetadata(metadataTxid);
  const passport = await readPassport(metadata);
  return passport;
};
