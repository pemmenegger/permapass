import { useState, useEffect } from "react";
import { Address, useWalletClient } from "wagmi";
import { NFTRegistry } from "../../contracts/NFTRegistry";
import { ArweaveURI, NFTPassportMetadata, PassportReadDetails } from "../../types";
import { getPublicClient } from "../../lib/wagmi";
import { zeroAddress } from "viem";

export function useNFTRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [createNFT, setCreateNFT] = useState<((tokenURI: ArweaveURI) => Promise<NFTPassportMetadata>) | undefined>(
    undefined
  );
  const [updateTokenURI, setUpdateTokenURI] = useState<
    ((tokenId: bigint, tokenURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);
  const [deleteNFT, setDeleteNFT] = useState<((tokenId: bigint) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const chainId = walletClient.chain.id;

    const contractAddress = NFTRegistry[chainId.toString() as keyof typeof NFTRegistry] as Address;
    if (!contractAddress) throw new Error(`useNFTRegistry - No contract address found for chainId: ${chainId}`);

    const publicClient = getPublicClient(chainId);

    const handleCreateNFT = async (tokenURI: ArweaveURI) => {
      try {
        const to = walletClient.account.address;

        const tokenIdPromise = new Promise<bigint>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Event Minted not received within 60 seconds"));
            unwatch?.();
          }, 60000); // 60 seconds

          const unwatch = publicClient.watchContractEvent({
            address: contractAddress,
            abi: NFTRegistry.abi,
            eventName: "Minted",
            args: { to, uri: tokenURI },
            onLogs: (logs) => {
              if (logs.length != 1) {
                throw new Error(`useNFTRegistry - Multiple or no Minted events found for token URI`);
              }
              const tokenId = logs[0].args.tokenId;
              if (!tokenId) {
                throw new Error(`useNFTRegistry - Minted event missing tokenId`);
              }
              clearTimeout(timeout);
              resolve(tokenId);
              unwatch?.();
            },
          });
        });

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: NFTRegistry.abi,
          functionName: "mintNFT",
          args: [to, tokenURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const tokenId = await tokenIdPromise;

        const metadata: NFTPassportMetadata = {
          type: "nft",
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
            abi: NFTRegistry.abi,
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
          abi: NFTRegistry.abi,
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

    const handleDeleteNFT = async (tokenId: bigint) => {
      try {
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: NFTRegistry.abi,
          functionName: "burn",
          args: [tokenId],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    setCreateNFT(() => handleCreateNFT);
    setUpdateTokenURI(() => handleUpdateTokenURI);
    setDeleteNFT(() => handleDeleteNFT);
  }, [walletClient, isError, isLoading]);

  const readNFTPassportHistory = async (metadata: NFTPassportMetadata): Promise<PassportReadDetails[]> => {
    const { tokenId, chainId, address } = metadata;

    const publicClient = getPublicClient(chainId);

    try {
      let previousChange: bigint = await publicClient.readContract({
        address: address as Address,
        abi: NFTRegistry.abi,
        functionName: "changed",
        args: [tokenId],
      });

      const passportVersions: PassportReadDetails[] = [];
      while (previousChange) {
        const events = await publicClient.getContractEvents({
          address: address as Address,
          abi: NFTRegistry.abi,
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

  const ownerOf = async (metadata: NFTPassportMetadata): Promise<Address> => {
    const { tokenId, chainId, address } = metadata;

    const publicClient = getPublicClient(chainId);

    try {
      const exists = await publicClient.readContract({
        address: address as Address,
        abi: NFTRegistry.abi,
        functionName: "exists",
        args: [tokenId],
      });

      if (!exists) {
        return zeroAddress;
      }

      return await publicClient.readContract({
        address: address as Address,
        abi: NFTRegistry.abi,
        functionName: "ownerOf",
        args: [tokenId],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    nftRegistry: {
      createNFT,
      updateTokenURI,
      readNFTPassportHistory,
      deleteNFT,
      ownerOf,
    },
  };
}
