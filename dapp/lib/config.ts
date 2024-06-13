import {
  EXPO_PUBLIC_ENVIRONMENT,
  EXPO_PUBLIC_HOST,
  EXPO_PUBLIC_WEB_API_URL,
  EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID,
  EXPO_PUBLIC_INFURA_PROJECT_ID,
} from "@env";

type Config = {
  readonly EVENT_WAITING_TIMEOUT_MS: number;
  readonly EVENT_WAITING_TIMEOUT_MIN: number;
  readonly ENVIRONMENT: string;
  readonly HARDHAT_RPC_URL: string;
  readonly INFURA_PROJECT_ID: string;
  readonly WEB_API_URL: string;
  readonly BASE_URI_SCHEME: string;
  readonly WALLETCONNECT_CLOUD_PROJECT_ID: string;
};

const getConfig = (): Config => {
  if (!EXPO_PUBLIC_ENVIRONMENT) throw new Error("EXPO_PUBLIC_ENVIRONMENT is required");
  if (!EXPO_PUBLIC_HOST) throw new Error("EXPO_PUBLIC_HOST is required");
  if (!EXPO_PUBLIC_WEB_API_URL) throw new Error("EXPO_PUBLIC_WEB_API_URL is required");
  if (!EXPO_PUBLIC_INFURA_PROJECT_ID) throw new Error("EXPO_PUBLIC_INFURA_PROJECT_ID is required");
  if (!EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID)
    throw new Error("EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID is required");

  const eventWaitingTimeoutMs = 300000; // 5 minutes

  console.log(`configured ENVIROMENT: ${EXPO_PUBLIC_ENVIRONMENT}`);
  console.log(`configured WEB_API_URL: ${EXPO_PUBLIC_WEB_API_URL}`);

  return {
    EVENT_WAITING_TIMEOUT_MS: eventWaitingTimeoutMs,
    EVENT_WAITING_TIMEOUT_MIN: eventWaitingTimeoutMs / 1000 / 60,
    ENVIRONMENT: EXPO_PUBLIC_ENVIRONMENT,
    INFURA_PROJECT_ID: EXPO_PUBLIC_INFURA_PROJECT_ID,
    WEB_API_URL: EXPO_PUBLIC_WEB_API_URL,
    WALLETCONNECT_CLOUD_PROJECT_ID: EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID,
    HARDHAT_RPC_URL: `http://${EXPO_PUBLIC_HOST}:8545`,
    BASE_URI_SCHEME: `com.permapass.app://`,
  };
};

const config = getConfig();

export default config;
