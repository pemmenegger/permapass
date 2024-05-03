import config from "./config";
import { DIDPassportMetadata, NFTPassportMetadata, Passport, PassportMetadata } from "../types";

const postArweaveApi = async (body: Passport | PassportMetadata): Promise<string> => {
  try {
    console.log("Uploading to Arweave...", body);
    const response = await fetch(config.ARWEAVE_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 504) {
        console.log("Gateway timeout, waiting 5 seconds before retrying...");
        // wait 5 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 5000));
        console.log("Retrying upload to Arweave...");
        postArweaveApi(body);
      }
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.txid) {
      throw new Error("No Arweave transaction id in response");
    }

    console.log("Uploaded to Arweave with txid:", data.txid);
    return data.txid;
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    throw error;
  }
};

export const arweave = {
  fromTxidToURI: (txid: string) => `ar://${txid}`,
  fromTxidToURL: (txid: string) => `https://arweave.net/${txid}`,
  fromURIToURL: (uri: string) => `https://arweave.net/${uri.replace("ar://", "")}`,
  uploadPassport: async (passport: Passport) => postArweaveApi(passport),
  uploadNFTPassportMetadata: async (metadata: NFTPassportMetadata) => postArweaveApi(metadata),
  uploadDIDPassportMetadata: async (metadata: DIDPassportMetadata) => postArweaveApi(metadata),
  fetchPassport: async (url: string): Promise<Passport> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error while fetching data, status: ${response.status}`);
    return response.json();
  },
  fetchPassportMetadata: async (url: string): Promise<PassportMetadata> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error while fetching metadata, status: ${response.status}`);
    return response.json();
  },
};
