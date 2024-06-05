import config from "./config";
import { ArweaveURI, PassportCreate, PassportMetadata } from "../types";
import { DIDDocument } from "../types/did";
import { fromTxidToURI, fromURIToURL } from "./utils";

const fetchUrl = async (url: string, requestInit?: RequestInit) => {
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

const uploadToArweave = async (body: PassportCreate | PassportMetadata) => {
  const data = await fetchWebApi(`/arweave`, { method: "POST", body });
  if (!data.txid) throw new Error("uploadToArweave - no txid in response");
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
    uploadPassport: async (passport: PassportCreate) => {
      const txid = await uploadToArweave(passport);
      const passportDataURI = fromTxidToURI(txid);
      return passportDataURI;
    },
    uploadPassportMetadata: async (metadata: PassportMetadata) => {
      const txid = await uploadToArweave(metadata);
      const metadataURI = fromTxidToURI(txid);
      return metadataURI;
    },
    fetchPassport: async (passportDataURI: ArweaveURI) => {
      const passportURL = fromURIToURL(passportDataURI);
      const data = await fetchUrl(passportURL);
      return JSON.parse(data) as PassportCreate;
    },
    fetchPassportMetadata: async (metadataURI: ArweaveURI) => {
      const metadataURL = fromURIToURL(metadataURI);
      const data = await fetchUrl(metadataURL);
      return JSON.parse(data) as PassportMetadata;
    },
  },
  veramo: {
    resolveDID,
  },
};
