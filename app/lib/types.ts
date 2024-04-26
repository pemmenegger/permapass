export type PassportMetadata = NFTPassportMetadata | DIDPassportMetadata;

export type NFTPassportMetadata = {
  type: "nft";
  chainId: number;
  address: string;
  tokenId: string;
};

export type DIDPassportMetadata = {
  type: "did";
  chainId: number;
  address: string;
  did: string;
  serviceId: string;
};

export interface Passport {
  name: string;
  condition: string;
}

// export type PassportType = "nft" | "did";
