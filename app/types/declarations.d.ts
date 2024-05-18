declare module "@env" {
  export const EXPO_PUBLIC_HOST: string;
  export const EXPO_PUBLIC_WEB_API_URL: string;
  export const EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID: string;
  export const EXPO_PUBLIC_ALCHEMY_API_KEY: string;
  export const EXPO_PUBLIC_INFURA_PROJECT_ID: string;
  export const EXPO_PUBLIC_PRIVATE_KEY: string;
}

declare module "@arx-research/libhalo/api/react-native.js" {
  import { NfcManager } from "react-native-nfc-manager";
  import { Buffer } from "buffer/";

  interface HaloResult {
    result: string;
    extra: Record<string, any>;
  }

  interface Command {
    name: string;
    message: string;
    keyNo: number;
  }

  interface ExecOptions {
    method?: string;
    exec?: (command: Buffer) => Promise<any>;
  }

  export function execCoreCommandRN(nfcManager: NfcManager, command: Buffer): Promise<HaloResult>;

  export function execHaloCmdRN(nfcManager: NfcManager, command: Command, options?: ExecOptions): Promise<any>;
}

declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
