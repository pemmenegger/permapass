export type PassportMetadata = NFTPassportMetadata | DIDPassportMetadata;

export interface NFTPassportMetadata {
  chainId: number;
  address: string;
  tokenId: string;
}

export interface DIDPassportMetadata {
  chainId: number;
  address: string;
  serviceId: string;
}

export interface Passport {
  name: string;
  condition: string;
}

// export type PassportType = "nft" | "did";
