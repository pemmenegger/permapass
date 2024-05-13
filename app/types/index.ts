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

export type PassportURIHistory = {
  uri: string;
  version: bigint;
  timestamp: bigint;
  sender: Address;
};
