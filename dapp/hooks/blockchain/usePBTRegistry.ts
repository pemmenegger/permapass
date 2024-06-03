import { useState, useEffect, useCallback } from "react";
import { Address, sepolia, useWalletClient } from "wagmi";
import { PermaPassPBTRegistry } from "../../contracts/PermaPassPBTRegistry";
import { readContract } from "@wagmi/core";
import { ArweaveURI, PBTPassportMetadata, PassportVersion } from "../../types";
import { getPublicClient } from "../../lib/wagmi";

export function usePBTRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [createPBT, setCreatePBT] = useState<
    | ((
        chipAddress: Address,
        signatureFromChip: Address,
        blockNumberUsedInSig: bigint,
        tokenURI: ArweaveURI
      ) => Promise<PBTPassportMetadata>)
    | undefined
  >(undefined);
  const [updateTokenURI, setUpdateTokenURI] = useState<
    ((tokenId: bigint, tokenURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);
  const [initMetadataURI, setInitMetadataURI] = useState<
    ((signatureFromChip: Address, blockNumberUsedInSig: bigint, metadataURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const chainId = walletClient.chain.id;

    const contractAddress = PermaPassPBTRegistry[chainId.toString() as keyof typeof PermaPassPBTRegistry] as Address;
    if (!contractAddress) throw new Error(`usePBTRegistry - No contract address found for chainId: ${chainId}`);

    const publicClient = getPublicClient(chainId);

    const handleCreatePBT = async (
      chipAddress: Address,
      signatureFromChip: Address,
      blockNumberUsedInSig: bigint,
      tokenURI: ArweaveURI
    ) => {
      try {
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: PermaPassPBTRegistry.abi,
          functionName: "mintPBT",
          args: [chipAddress, signatureFromChip, blockNumberUsedInSig, tokenURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const events = await publicClient.getContractEvents({
          address: contractAddress,
          abi: PermaPassPBTRegistry.abi,
          eventName: "PBTMint",
          args: { chipAddress },
        });

        if (events.length > 1) {
          throw new Error(`usePBTRegistry - Multiple Mint events found for token URI: ${tokenURI}`);
        } else if (events.length === 0) {
          throw new Error(`usePBTRegistry - Mint event not found for token URI: ${tokenURI}`);
        }

        const metadata: PBTPassportMetadata = {
          type: "pbt",
          chainId,
          address: contractAddress,
          tokenId: events[0].args.tokenId!,
        };

        return metadata;
      } catch (error) {
        console.error("Failed to mint PBT:", error);
        throw error;
      }
    };

    const handleUpdateTokenURI = async (tokenId: bigint, tokenURI: ArweaveURI) => {
      try {
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: PermaPassPBTRegistry.abi,
          functionName: "setTokenURI",
          args: [tokenId, tokenURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } catch (error) {
        console.error("Failed to update token URI:", error);
      }
    };

    const handleInitMetadataURI = async (
      signatureFromChip: Address,
      blockNumberUsedInSig: bigint,
      metadataURI: ArweaveURI
    ) => {
      try {
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: PermaPassPBTRegistry.abi,
          functionName: "initMetadataURI",
          args: [signatureFromChip, blockNumberUsedInSig, metadataURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } catch (error) {
        console.error("Failed to set metadata URI:", error);
      }
    };

    setCreatePBT(() => handleCreatePBT);
    setUpdateTokenURI(() => handleUpdateTokenURI);
    setInitMetadataURI(() => handleInitMetadataURI);
  }, [walletClient, isError, isLoading]);

  const readPBTPassportHistory = useCallback(async (metadata: PBTPassportMetadata): Promise<PassportVersion[]> => {
    const { tokenId, chainId, address } = metadata;

    const publicClient = getPublicClient(chainId);

    try {
      let previousChange: bigint = await readContract({
        chainId,
        address: address as Address,
        abi: PermaPassPBTRegistry.abi,
        functionName: "changed",
        args: [tokenId],
      });

      const passportVersions: PassportVersion[] = [];
      while (previousChange) {
        const events = await publicClient.getContractEvents({
          address: address as Address,
          abi: PermaPassPBTRegistry.abi,
          eventName: "TokenURIChanged",
          args: { tokenId },
          fromBlock: previousChange,
          toBlock: previousChange,
        });

        const block = await publicClient.getBlock({ blockNumber: previousChange });
        events.forEach((event) => {
          passportVersions.push({
            uri: event.args.uri! as ArweaveURI,
            blockTimestamp: block.timestamp,
            sender: event.args.sender!,
          });
        });

        const lastEvent = events[events.length - 1];
        previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
      }

      return passportVersions;
    } catch (error) {
      console.error("Failed to read PBT passport URI history:", error);
      throw error;
    }
  }, []);

  const readMetadataURI = useCallback(async (chipAddress: Address): Promise<ArweaveURI> => {
    let chainId = walletClient?.chain.id;
    if (!chainId) {
      // default to sepolia
      chainId = sepolia.id;
    }

    const contractAddress = PermaPassPBTRegistry[chainId.toString() as keyof typeof PermaPassPBTRegistry] as Address;
    if (!contractAddress) throw new Error(`usePBTRegistry - No contract address found for chainId: ${chainId}`);

    try {
      const metadataURI = await readContract({
        chainId,
        address: contractAddress,
        abi: PermaPassPBTRegistry.abi,
        functionName: "metadataURIs",
        args: [chipAddress],
      });

      return metadataURI as ArweaveURI;
    } catch (error) {
      console.error("Failed to read PBT metadata URI:", error);
      throw error;
    }
  }, []);

  return {
    pbtRegistry: {
      createPBT,
      initMetadataURI,
      updateTokenURI,
      readPBTPassportHistory,
      readMetadataURI,
    },
  };
}
