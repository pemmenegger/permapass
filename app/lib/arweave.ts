import { DIDPassportMetadata, NFTPassportMetadata, Passport, PassportMetadata } from "./types";

const apiUrl = process.env.EXPO_PUBLIC_ARWEAVE_API_URL;
if (!apiUrl) {
  const errorMessage = "API URL is not set in environment variables.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const fromArweaveTxidToURL = (arweaveTxid: string): string => {
  return `https://arweave.net/${arweaveTxid}`;
};

export const fromArweaveTxidToURI = (arweaveTxid: string): string => {
  return `ar://${arweaveTxid}`;
};

const postArweaveApi = async (body: Passport | PassportMetadata): Promise<string> => {
  try {
    console.log("Uploading to Arweave...", body);
    const response = await fetch(apiUrl, {
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

    return data.txid;
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    throw error;
  }
};

export const uploadPassport = async (passport: Passport): Promise<string> => {
  return postArweaveApi(passport);
};

export const uploadNFTPassportMetadata = async (metadata: NFTPassportMetadata): Promise<string> => {
  return postArweaveApi(metadata);
};

export const uploadDIDPassportMetadata = async (metadata: DIDPassportMetadata): Promise<string> => {
  return postArweaveApi(metadata);
};
