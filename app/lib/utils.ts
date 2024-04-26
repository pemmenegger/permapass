import config from "./config";

export const fromArweaveTxidToPassportMetadataURL = (txid: string) => {
  return config.BASE_URI_SCHEME + `/read?arweaveTxid=${txid}`;
};
