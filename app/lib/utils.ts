import { arweave } from "./arweave";
import { blockchain } from "./blockchain";
import config from "./config";
import { PassportMetadata } from "../types";

export const fromArweaveTxidToPassportMetadataURL = (txid: string) => {
  return config.BASE_URI_SCHEME + `/read?arweaveTxid=${txid}`;
};

export const readPassportMetadata = async (arweaveTxid: string) => {
  const metadataURL = arweave.fromTxidToURL(arweaveTxid);
  const metadata = await arweave.fetchPassportMetadata(metadataURL);
  return metadata;
};

export const readPassport = async (metadata: PassportMetadata) => {
  switch (metadata.type) {
    case "nft":
      return await blockchain.readNFTPassport(metadata);
    case "did":
      throw new Error(`did not implemented`);
    default:
      throw new Error(`Unknown passport type: ${metadata}`);
  }
};

export const readPassportFromMetadataTxid = async (metadataTxid: string) => {
  const metadata = await readPassportMetadata(metadataTxid);
  const passport = await readPassport(metadata);
  return passport;
};
