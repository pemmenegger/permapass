import config from "./config";
import { Address, Chain } from "viem";
import { ArweaveURI, ArweaveURL, PassportCreate } from "../types";
import { router } from "expo-router";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { WalletClient, sepolia, useWalletClient } from "wagmi";

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

export const fromBlockTimestampToDateTime = (blockTimestamp: bigint) => {
  const readableDate = new Date(Number(blockTimestamp) * 1000);
  const formattedDate = readableDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  return formattedDate;
};

export const fromCamelCaseToTitleCase = (camelCase: string) => {
  const result = camelCase.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const pickPassportJSON = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
    if (result.canceled) return;
    if (!result.assets) return;
    const file = result.assets[0];
    const response = await fetch(file.uri);
    const fileContent = await response.json();
    return fileContent as PassportCreate;
  } catch (error) {
    Alert.alert("Error", "Failed to read the file. Please try again.");
  }
};

export const isSepoliaSwitchRequired = (walletClient: WalletClient | null | undefined) => {
  if (config.ENVIRONMENT == "prod" && walletClient?.chain.id != sepolia.id) {
    return true;
  }
  return false;
};
