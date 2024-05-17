declare module "@arx-research/libhalo/api/react-native.js" {
  import { NfcManager } from "react-native-nfc-manager";
  import { Buffer } from "buffer/";

  interface HaloResult {
    result: string;
    extra: Record<string, any>;
  }

  interface Command {
    name: string;
    message?: string;
    digest?: string;
    keyNo?: number;
    format?: string;
    legacySignCommand?: boolean;
  }

  interface ExecOptions {
    method?: string;
    exec?: (command: Buffer) => Promise<any>;
  }

  export function execCoreCommandRN(nfcManager: NfcManager, command: Buffer): Promise<HaloResult>;

  export function execHaloCmdRN(nfcManager: NfcManager, command: Command, options?: ExecOptions): Promise<any>;
}

declare module "@arx-research/libhalo/api/common.js" {
  import { Buffer } from "buffer/";

  export const SECP256k1_ORDER: Buffer;

  export function haloConvertSignature(
    digest: Buffer,
    der: Buffer,
    publicKey: string,
    order: Buffer
  ): {
    ether: string;
    raw: Buffer;
  };

  export function haloRecoverPublicKey(digest: Buffer, der: Buffer, order: Buffer): string;
}
