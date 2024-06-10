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
  width: string;
  height: string;
  thickness: string;
  usage: string;
  materials: string;
  dateManufactured: string;
  warranty: string;
  environmentalImpact: string;
  carbonFootprint: string;
  recycling: string;
  disposalInstructions: string;
}

export interface PassportReadDetails {
  uri: ArweaveURI;
  blockTimestamp: bigint;
}

export interface PassportRead {
  data: PassportCreate;
  details: PassportReadDetails;
}

export type PassportHistory = {
  entries: PassportRead[];
  ownerAddress: Address;
};

export type DataCarrier = "qr" | "nfc";

export type DigitalIdentifier = "nft" | "pbt" | "did";

export type ArweaveURI = `ar://${string}`;

export type ArweaveURL = `https://arweave.net/${string}`;

export interface IconProps {
  height: number;
  color: string;
  strokeWidth?: number;
}
