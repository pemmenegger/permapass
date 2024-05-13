import config from "./config";
import { DIDPassportMetadata, NFTPassportMetadata, Passport, PassportMetadata } from "../types";
import { DIDDocument } from "../types/did";

const fetchUrl = async (url: string, requestInit?: RequestInit) => {
  console.log(`fetching ${url}`);
  const response = await fetch(url, requestInit);
  if (!response.ok) {
    console.error(JSON.stringify(response));
    throw new Error("Error while fetching data");
  }
  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await response.json() : await response.text();
  return data;
};

const fetchWebApi = async (
  endpoint: string,
  { method, body, headers = {} }: { method: string; body?: any; headers?: any }
) => {
  const fullUrl = `${config.WEB_API_URL}${endpoint}`;
  if (body) headers["Content-Type"] = "application/json";
  return await fetchUrl(fullUrl, { method, headers, ...(body && { body: JSON.stringify(body) }) });
};

const uploadToArweave = async (body: Passport | PassportMetadata) => {
  const data = await fetchWebApi(`/arweave`, { method: "POST", body });
  if (!data.txid) throw new Error("uploadToArweave - no txid in response");
  console.log("uploadToArweave - uploaded with txid:", data.txid);
  return data.txid as string;
};

const resolveDID = async (didUrl: string, registryAddress?: string) => {
  let query = `didUrl=${didUrl}`;
  if (registryAddress) {
    query += `&registryAddress=${registryAddress}`;
  }
  return (await fetchWebApi(`/did?${query}`, { method: "GET" })) as DIDDocument;
};

export const api = {
  arweave: {
    fromTxidToURI: (txid: string) => `ar://${txid}`,
    fromTxidToURL: (txid: string) => `https://arweave.net/${txid}`,
    fromURIToURL: (uri: string) => `https://arweave.net/${uri.replace("ar://", "")}`,
    uploadPassport: async (passport: Passport) => await uploadToArweave(passport),
    uploadNFTPassportMetadata: async (metadata: NFTPassportMetadata) => await uploadToArweave(metadata),
    uploadDIDPassportMetadata: async (metadata: DIDPassportMetadata) => await uploadToArweave(metadata),
    fetchPassport: async (url: string): Promise<Passport> => {
      const data = await fetchUrl(url);
      return JSON.parse(data) as Passport;
    },
    fetchPassportMetadata: async (url: string): Promise<PassportMetadata> => {
      const data = await fetchUrl(url);
      return JSON.parse(data) as PassportMetadata;
    },
  },
  veramo: {
    resolveDID,
  },
};
