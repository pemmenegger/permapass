import config from "./config";
import { DIDPassportMetadata, NFTPassportMetadata, Passport, PassportMetadata } from "../types";

const postArweaveApi = async (body: Passport | PassportMetadata) => {
  console.log("Uploading to Arweave...", body);
  const response = await fetch(config.ARWEAVE_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Arweave API Error - ${JSON.stringify(data)}`);
  if (!data.txid) throw new Error("Arweave API Error - no txid in response");
  console.log("Uploaded to Arweave with txid:", data.txid);

  return data.txid as string;
};

const fetchArweaveApi = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Arweave API Error - error while fetching data, status: ${response.status}`);
  const data = await response.json();
  return data;
};

export const arweave = {
  fromTxidToURI: (txid: string) => `ar://${txid}`,
  fromTxidToURL: (txid: string) => `https://arweave.net/${txid}`,
  fromURIToURL: (uri: string) => `https://arweave.net/${uri.replace("ar://", "")}`,
  uploadPassport: async (passport: Passport) => await postArweaveApi(passport),
  uploadNFTPassportMetadata: async (metadata: NFTPassportMetadata) => await postArweaveApi(metadata),
  uploadDIDPassportMetadata: async (metadata: DIDPassportMetadata) => await postArweaveApi(metadata),
  fetchPassport: async (url: string) => {
    const data = await fetchArweaveApi(url);
    return data as Passport;
  },
  fetchPassportMetadata: async (url: string) => {
    const data = await fetchArweaveApi(url);
    return data as PassportMetadata;
  },
};
