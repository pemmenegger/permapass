import {
  EXPO_PUBLIC_ARWEAVE_API_URL,
  EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID,
  EXPO_PUBLIC_ALCHEMY_API_KEY,
  EXPO_PUBLIC_INFURA_PROJECT_ID,
  EXPO_PUBLIC_PRIVATE_KEY,
} from "@env";

type Config = {
  readonly LOCALHOST_INTERNAL_IP: string;
  readonly INFURA_PROJECT_ID: string;
  readonly ARWEAVE_API_URL: string;
  readonly PRIVATE_KEY: string;
  readonly DB_ENCRYPTION_KEY: string;
  readonly BASE_URI_SCHEME: string;
  readonly WALLETCONNECT_CLOUD_PROJECT_ID: string;
};

const getConfig = (): Config => {
  const INFURA_PROJECT_ID = EXPO_PUBLIC_INFURA_PROJECT_ID;
  if (!INFURA_PROJECT_ID) throw new Error("EXPO_PUBLIC_INFURA_PROJECT_ID is required");

  const WALLETCONNECT_CLOUD_PROJECT_ID = EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID;
  if (!WALLETCONNECT_CLOUD_PROJECT_ID) throw new Error("EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID is required");

  const ARWEAVE_API_URL = EXPO_PUBLIC_ARWEAVE_API_URL;
  if (!ARWEAVE_API_URL) throw new Error("EXPO_PUBLIC_ARWEAVE_API_URL is required");

  const PRIVATE_KEY = EXPO_PUBLIC_PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    throw new Error("EXPO_PUBLIC_PRIVATE_KEY is required");
  }

  const LOCALHOST_INTERNAL_IP = "192.168.91.91";
  // const LOCALHOST_INTERNAL_IP = "192.168.0.25";

  return {
    LOCALHOST_INTERNAL_IP,
    INFURA_PROJECT_ID,
    ARWEAVE_API_URL,
    PRIVATE_KEY,
    DB_ENCRYPTION_KEY: "29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c",
    BASE_URI_SCHEME: `exp://${LOCALHOST_INTERNAL_IP}:8081/--`,
    WALLETCONNECT_CLOUD_PROJECT_ID,
  };
};

const config = getConfig();

export default config;
