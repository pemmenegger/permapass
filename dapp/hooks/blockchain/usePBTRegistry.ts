import { useState, useEffect } from "react";
import { Address, useWalletClient } from "wagmi";
import { PBTRegistry } from "../../contracts/PBTRegistry";
import { ArweaveURI, PBTPassportMetadata, PassportReadDetails } from "../../types";
import { getPublicClient } from "../../lib/wagmi";
import { HaLoNFCChipSignatureOutput } from "../useHaloNFCChip";
import { zeroAddress } from "viem";

export function usePBTRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [createPBT, setCreatePBT] = useState<
    ((chipSignature: HaLoNFCChipSignatureOutput, tokenURI: ArweaveURI) => Promise<PBTPassportMetadata>) | undefined
  >(undefined);
  const [updateTokenURI, setUpdateTokenURI] = useState<
    ((tokenId: bigint, tokenURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);
  const [deletePBT, setDeletePBT] = useState<((tokenId: bigint) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const chainId = walletClient.chain.id;

    const contractAddress = PBTRegistry[chainId.toString() as keyof typeof PBTRegistry] as Address;
    if (!contractAddress) throw new Error(`usePBTRegistry - No contract address found for chainId: ${chainId}`);

    const publicClient = getPublicClient(chainId);

    const handleCreatePBT = async (chipSignature: HaLoNFCChipSignatureOutput, tokenURI: ArweaveURI) => {
      try {
        const { chipAddress, signatureFromChip, blockNumberUsedInSig } = chipSignature;

        const tokenIdPromise = new Promise<bigint>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Event PBTMint not received within 60 seconds"));
            unwatch?.();
          }, 60000); // 60 seconds

          const unwatch = publicClient.watchContractEvent({
            address: contractAddress,
            abi: PBTRegistry.abi,
            eventName: "PBTMint",
            args: { chipAddress },
            onLogs: (logs) => {
              if (logs.length != 1) {
                throw new Error(`usePBTRegistry - Multiple or no Minted events found for token URI`);
              }
              const tokenId = logs[0].args.tokenId;
              if (!tokenId) {
                throw new Error(`usePBTRegistry - Minted event missing tokenId`);
              }
              clearTimeout(timeout);
              resolve(tokenId);
              unwatch?.();
            },
          });
        });

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: PBTRegistry.abi,
          functionName: "mintPBT",
          args: [chipAddress, signatureFromChip, blockNumberUsedInSig, tokenURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const tokenId = await tokenIdPromise;

        const metadata: PBTPassportMetadata = {
          type: "pbt",
          chainId,
          address: contractAddress,
          tokenId,
        };

        return metadata;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    const handleUpdateTokenURI = async (tokenId: bigint, tokenURI: ArweaveURI) => {
      try {
        const tokenURIChangedEvent = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Event TokenURIChanged not received within 60 seconds"));
            unwatch?.();
          }, 60000); // 60 seconds

          const unwatch = publicClient.watchContractEvent({
            address: contractAddress,
            abi: PBTRegistry.abi,
            eventName: "TokenURIChanged",
            args: { tokenId },
            onLogs: (logs) => {
              for (const log of logs) {
                if (log.args.uri === tokenURI) {
                  clearTimeout(timeout);
                  resolve();
                  unwatch?.();
                  break;
                }
              }
            },
          });
        });

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: PBTRegistry.abi,
          functionName: "setTokenURI",
          args: [tokenId, tokenURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        await tokenURIChangedEvent;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    const handleDeletePBT = async (tokenId: bigint) => {
      try {
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: PBTRegistry.abi,
          functionName: "burn",
          args: [tokenId],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    setCreatePBT(() => handleCreatePBT);
    setUpdateTokenURI(() => handleUpdateTokenURI);
    setDeletePBT(() => handleDeletePBT);
  }, [walletClient, isError, isLoading]);

  const readPBTPassportHistory = async (metadata: PBTPassportMetadata): Promise<PassportReadDetails[]> => {
    const { tokenId, chainId, address } = metadata;

    const publicClient = getPublicClient(chainId);

    try {
      let previousChange: bigint = await publicClient.readContract({
        address: address as Address,
        abi: PBTRegistry.abi,
        functionName: "changed",
        args: [tokenId],
      });

      const passportVersions: PassportReadDetails[] = [];
      while (previousChange) {
        const events = await publicClient.getContractEvents({
          address: address as Address,
          abi: PBTRegistry.abi,
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
          });
        });

        const lastEvent = events[events.length - 1];
        previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
      }

      return passportVersions;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const ownerOf = async (metadata: PBTPassportMetadata): Promise<Address> => {
    const { tokenId, chainId, address } = metadata;

    const publicClient = getPublicClient(chainId);

    try {
      const exists = await publicClient.readContract({
        address: address as Address,
        abi: PBTRegistry.abi,
        functionName: "exists",
        args: [tokenId],
      });

      if (!exists) {
        return zeroAddress;
      }

      return await publicClient.readContract({
        address: address as Address,
        abi: PBTRegistry.abi,
        functionName: "ownerOf",
        args: [tokenId],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    pbtRegistry: {
      createPBT,
      updateTokenURI,
      readPBTPassportHistory,
      deletePBT,
      ownerOf,
    },
  };
}
