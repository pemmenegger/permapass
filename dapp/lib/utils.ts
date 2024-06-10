import config from "./config";
import { Address, Chain } from "viem";
import { ArweaveURI, ArweaveURL, PassportCreate } from "../types";
import { router } from "expo-router";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { PublicClient, WalletClient, sepolia } from "wagmi";

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

export const formatBalance = (formatted: string) => {
  const num = parseFloat(formatted);
  if (isNaN(num)) {
    throw new Error("Invalid number format");
  }
  return num.toFixed(Math.min(4, (num.toString().split(".")[1] || "").length));
};

export const formatAddress = (address: string) => {
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
  // clear history
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

export const writeContractAndAwaitEvent = async <T>(
  publicClient: PublicClient,
  writeContractFn: () => Promise<`0x${string}`>,
  eventWatcher: () => { unwatch: () => void; promise: Promise<T> },
  eventName: string,
  contractName: string
): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined;
  let unwatch: (() => void) | undefined;

  const { unwatch: stopWatching, promise: eventPromise } = eventWatcher();
  unwatch = stopWatching;

  const wrappedEventPromise = new Promise<T>(async (resolve, reject) => {
    try {
      console.log(`${contractName} - Starting timer for ${eventName} event`);
      timeout = setTimeout(() => {
        reject(
          new Error(
            `${contractName} - Event ${eventName} not received within ${config.EVENT_WAITING_TIMEOUT_MIN} minutes`
          )
        );
      }, config.EVENT_WAITING_TIMEOUT_MS);

      console.log(`${contractName} - Watching ${eventName} event...`);
      const result = await eventPromise;
      resolve(result);
    } catch (error) {
      console.log(`${contractName} - Error watching ${eventName} event`, error);
      reject(error);
    }
  });

  try {
    const txHash = await writeContractFn();
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`${contractName} - Transaction receipt received`);

    const eventResult = await wrappedEventPromise;

    console.log(`${contractName} - Clearing timer and unwatching ${eventName} event...`);
    if (timeout) clearTimeout(timeout);
    if (unwatch) unwatch();

    return eventResult;
  } catch (error) {
    console.error(`${contractName} - Error during transaction or waiting for receipt: ${error}`);
    if (timeout) clearTimeout(timeout);
    if (unwatch) unwatch();
    throw error;
  }
};
