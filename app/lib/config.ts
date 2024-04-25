type Config = {
  readonly LOCALHOST_INTERNAL_IP: string;
  readonly INFURA_PROJECT_ID: string;
  readonly DB_ENCRYPTION_KEY: string;
  readonly BASE_URI_SCHEME: string;
  readonly WALLETCONNECT_CLOUD_PROJECT_ID: string;
};

const getConfig = (): Config => {
  const INFURA_PROJECT_ID = process.env.EXPO_PUBLIC_INFURA_PROJECT_ID;
  if (!INFURA_PROJECT_ID) throw new Error("INFURA_PROJECT_ID is required");

  const WALLETCONNECT_CLOUD_PROJECT_ID = process.env.EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID;
  if (!WALLETCONNECT_CLOUD_PROJECT_ID) throw new Error("WALLETCONNECT_CLOUD_PROJECT_ID is required");

  // const LOCALHOST_INTERNAL_IP = "192.168.91.91";
  const LOCALHOST_INTERNAL_IP = "192.168.0.25";

  return {
    LOCALHOST_INTERNAL_IP,
    INFURA_PROJECT_ID,
    DB_ENCRYPTION_KEY: "29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c",
    BASE_URI_SCHEME: `exp://${LOCALHOST_INTERNAL_IP}:8081/--`,
    WALLETCONNECT_CLOUD_PROJECT_ID,
  };
};

const config = getConfig();

export default config;
