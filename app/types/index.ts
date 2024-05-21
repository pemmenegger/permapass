import { Address } from "viem";

export type PassportType = "nft" | "did";

export type PassportMetadata = NFTPassportMetadata | DIDPassportMetadata;

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

export interface Passport {
  name: string;
  condition: string;
}

export interface PassportCreate {
  name: string;
  condition: string;
}

export interface PassportRead extends PassportCreate {
  version: bigint;
  timestamp: bigint;
  sender: string;
}

export type DataCarrierType = "qr" | "nfc";

export type DigitalIdentifierType = "nft" | "pbt" | "did";

export type PassportVersion = {
  uri: ArweaveURI;
  timestamp: bigint;
  version?: bigint;
  sender?: Address;
};

export type ArweaveURI = `ar://${string}`;

export type ArweaveURL = `https://arweave.net/${string}`;

export interface IconProps {
  height: number;
  color: string;
  strokeWidth?: number;
}
