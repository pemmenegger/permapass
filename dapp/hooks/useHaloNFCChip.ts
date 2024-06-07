import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { getPublicClient } from "../lib/wagmi";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { execHaloCmdRN } from "@arx-research/libhalo/api/react-native.js";
import { Address, encodePacked, keccak256 } from "viem";
import { err } from "react-native-svg/lib/typescript/xml";

NfcManager.start();

export interface HaLoNFCChipSignatureOutput {
  chipAddress: Address;
  signatureFromChip: Address;
  blockNumberUsedInSig: bigint;
}

export function useHaLoNFCChip() {
  const KEY_NO = 1;
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [computeSignatureFromChip, setComputeSignatureFromChip] = useState<
    (() => Promise<HaLoNFCChipSignatureOutput>) | undefined
  >(undefined);

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const generateDigestToSign = async () => {
      const chainId = walletClient.chain.id;
      const address = walletClient.account.address;

      const publicClient = getPublicClient(chainId);

      const currentBlockNumber = await publicClient.getBlockNumber();
      console.log(`Current Block Number: ${currentBlockNumber}`);
      const blockNumberUsedInSig = currentBlockNumber - BigInt(1);
      console.log(`Block Number Used in Signature: ${blockNumberUsedInSig}`);

      const block = await publicClient.getBlock({
        blockNumber: blockNumberUsedInSig,
      });
      const blockhash = block.hash;

      const messagePrefix = "\x19Ethereum Signed Message:\n32";
      const message = keccak256(encodePacked(["address", "bytes32"], [address, blockhash]));
      const commandDigest = keccak256(encodePacked(["string", "bytes32"], [messagePrefix, message]));
      console.log(`Command Digest: ${commandDigest}`);
      return {
        commandDigest,
        blockNumberUsedInSig,
      };
    };

    const handleComputeSignatureFromChip = async () => {
      try {
        await NfcManager.requestTechnology(NfcTech.IsoDep);

        const { commandDigest, blockNumberUsedInSig } = await generateDigestToSign();

        let signature = await execHaloCmdRN(NfcManager, {
          name: "sign",
          digest: commandDigest.startsWith("0x") ? commandDigest.slice(2) : commandDigest,
          keyNo: KEY_NO,
        });

        return {
          chipAddress: signature.etherAddress,
          signatureFromChip: signature.signature.ether,
          blockNumberUsedInSig,
        };
      } catch (ex) {
        throw new Error(`Failed to compute signature from chip: ${ex}`);
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    };

    setComputeSignatureFromChip(() => handleComputeSignatureFromChip);
  }, [walletClient, isError, isLoading]);

  const readChipAddress = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.IsoDep);

      let dummySignatureToReadChipAddress = await execHaloCmdRN(NfcManager, {
        name: "sign",
        message: "Dummy Message",
        format: "text",
        keyNo: KEY_NO,
      });

      return dummySignatureToReadChipAddress.etherAddress as Address;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  return {
    haloNFCChip: {
      computeSignatureFromChip,
      readChipAddress,
    },
  };
}