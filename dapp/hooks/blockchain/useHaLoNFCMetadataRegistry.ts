import { useState, useEffect, useCallback } from "react";
import { Address, sepolia, useWalletClient } from "wagmi";
import { readContract } from "@wagmi/core";
import { ArweaveURI } from "../../types";
import { getPublicClient } from "../../lib/wagmi";
import { HaLoNFCChipSignatureOutput } from "../useHaloNFCChip";
import { HaLoNFCMetadataRegistry } from "../../contracts/HaLoNFCMetadataRegistry";

export function useHaLoNFCMetadataRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [initMetadataURI, setInitMetadataURI] = useState<
    ((chipSignature: HaLoNFCChipSignatureOutput, metadataURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const chainId = walletClient.chain.id;

    const contractAddress = HaLoNFCMetadataRegistry[
      chainId.toString() as keyof typeof HaLoNFCMetadataRegistry
    ] as Address;
    if (!contractAddress) throw new Error(`usePBTRegistry - No contract address found for chainId: ${chainId}`);

    const publicClient = getPublicClient(chainId);

    const handleInitMetadataURI = async (chipSignature: HaLoNFCChipSignatureOutput, metadataURI: ArweaveURI) => {
      try {
        const { chipAddress, signatureFromChip, blockNumberUsedInSig } = chipSignature;
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: HaLoNFCMetadataRegistry.abi,
          functionName: "initMetadataURI",
          args: [chipAddress, signatureFromChip, blockNumberUsedInSig, metadataURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    setInitMetadataURI(() => handleInitMetadataURI);
  }, [walletClient, isError, isLoading]);

  const readMetadataURI = async (chipAddress: Address): Promise<ArweaveURI> => {
    let chainId = walletClient?.chain.id;
    if (!chainId) {
      // default to sepolia
      chainId = sepolia.id;
    }

    const contractAddress = HaLoNFCMetadataRegistry[
      chainId.toString() as keyof typeof HaLoNFCMetadataRegistry
    ] as Address;
    if (!contractAddress) throw new Error(`usePBTRegistry - No contract address found for chainId: ${chainId}`);

    try {
      const metadataURI = await readContract({
        chainId,
        address: contractAddress,
        abi: HaLoNFCMetadataRegistry.abi,
        functionName: "metadataURIs",
        args: [chipAddress],
      });

      return metadataURI as ArweaveURI;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    haLoNFCMetadataRegistry: {
      initMetadataURI,
      readMetadataURI,
    },
  };
}
