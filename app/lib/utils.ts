import config from "./config";
import { Address, Chain } from "viem";
import { ArweaveURI, ArweaveURL } from "../types";
import { router } from "expo-router";

export const encodeDataCarrierURL = (metadataURI: ArweaveURI) => {
  return config.BASE_URI_SCHEME + `read?metadataURI=${metadataURI}`;
};

export const fromTxidToURI = (txid: string): ArweaveURI => `ar://${txid}`;

export const fromTxidToURL = (txid: string): ArweaveURL => `https://arweave.net/${txid}`;

export const fromURIToURL = (uri: string): ArweaveURL => `https://arweave.net/${uri.replace("ar://", "")}`;

export const fromDIDToIdentity = (did: string): Address => did.split(":")[3] as Address;

export const formatNetworkName = (chains: Chain[], networkId?: number) => {
  const chain = chains.find((chain) => chain.id === networkId);
  return chain ? chain.name : "Unknown";
};

export const formatBalance = (formatted?: string) => {
  if (!formatted) {
    return "0";
  }
  const num = parseFloat(formatted);
  if (isNaN(num)) {
    throw new Error("Invalid number format");
  }
  return num.toFixed(Math.min(4, (num.toString().split(".")[1] || "").length));
};

export const formatAddress = (address?: string) => {
  if (!address) {
    return "";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDID = (did: string) => {
  // did:ethr:hardhat:0x1234...5678
  const address = fromDIDToIdentity(did);
  const formattedAddress = formatAddress(address);
  const didParts = did.split(":");
  return `${didParts[0]}:${didParts[1]}:${didParts[2]}:${formattedAddress}`;
};

export const goToHome = () => {
  while (router.canGoBack()) {
    router.back();
  }
  router.push("/");
};
