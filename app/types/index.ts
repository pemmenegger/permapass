import { Address } from "viem";

export type PassportMetadata = NFTPassportMetadata | DIDPassportMetadata | PBTPassportMetadata;

export type PBTPassportMetadata = {
  type: "pbt";
  chainId: number;
  address: string;
  tokenId: bigint;
};

export type NFTPassportMetadata = {
  type: "nft";
  chainId: number;
  address: string;
  tokenId: bigint;
};

export type DIDPassportMetadata = {
  type: "did";
  chainId: number;
  address: string;
  did: string;
  serviceType: string;
};

export interface PassportCreate {
  name: string;
  condition: string;
}

export type PassportVersion = {
  uri: ArweaveURI;
  blockTimestamp: bigint;
  sender?: Address;
};

export interface PassportRead {
  data: PassportCreate;
  version: PassportVersion;
}

export type DataCarrierType = "qr" | "nfc";

export type DigitalIdentifierType = "nft" | "pbt" | "did";

export type ArweaveURI = `ar://${string}`;

export type ArweaveURL = `https://arweave.net/${string}`;

export interface IconProps {
  height: number;
  color: string;
  strokeWidth?: number;
}
