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
