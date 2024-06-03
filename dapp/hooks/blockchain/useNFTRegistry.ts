import { useState, useEffect, useCallback } from "react";
import { Address, useWalletClient } from "wagmi";
import { PermaPassNFTRegistry } from "../../contracts/PermaPassNFTRegistry";
import { readContract } from "@wagmi/core";
import { ArweaveURI, NFTPassportMetadata, PassportVersion } from "../../types";
import { getPublicClient } from "../../lib/wagmi";

export function useNFTRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [createNFT, setCreateNFT] = useState<((tokenURI: ArweaveURI) => Promise<NFTPassportMetadata>) | undefined>(
    undefined
  );
  const [updateTokenURI, setUpdateTokenURI] = useState<
    ((tokenId: bigint, tokenURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);
  const [deleteNFT, setDeleteNFT] = useState<((tokenId: bigint) => Promise<void>) | undefined>(undefined);
  const [isOwner, setIsOwner] = useState<((metadata: NFTPassportMetadata) => Promise<boolean>) | undefined>(undefined);

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const chainId = walletClient.chain.id;

    const contractAddress = PermaPassNFTRegistry[chainId.toString() as keyof typeof PermaPassNFTRegistry] as Address;
    if (!contractAddress) throw new Error(`useNFTRegistry - No contract address found for chainId: ${chainId}`);

    const publicClient = getPublicClient(chainId);

    const handleCreateNFT = async (tokenURI: ArweaveURI) => {
      try {
        const to = walletClient.account.address;

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: PermaPassNFTRegistry.abi,
          functionName: "safeMint",
          args: [to, tokenURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const events = await publicClient.getContractEvents({
          address: contractAddress,
          abi: PermaPassNFTRegistry.abi,
          eventName: "Minted",
          args: { to, uri: tokenURI },
        });

        if (events.length != 1) {
          throw new Error(`useNFTRegistry - Minted event not found for token URI`);
        }

        const metadata: NFTPassportMetadata = {
          type: "nft",
          chainId,
          address: contractAddress,
          tokenId: events[0].args.tokenId!,
        };

        return metadata;
      } catch (error) {
        console.error(`useNFTRegistry - Failed to create NFT:`, error);
        throw error;
      }
    };

    const handleUpdateTokenURI = async (tokenId: bigint, tokenURI: ArweaveURI) => {
      try {
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: PermaPassNFTRegistry.abi,
          functionName: "setTokenURI",
          args: [tokenId, tokenURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } catch (error) {
        console.error(`useNFTRegistry - Failed to update NFT token URI:`, error);
        throw error;
      }
    };

    const handleDeleteNFT = async (tokenId: bigint) => {
      try {
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: PermaPassNFTRegistry.abi,
          functionName: "burn",
          args: [tokenId],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } catch (error) {
        console.error(`useNFTRegistry - Failed to delete NFT:`, error);
        throw error;
      }
    };

    const handleIsOwner = async (metadata: NFTPassportMetadata) => {
      const { tokenId, chainId, address } = metadata;

      try {
        const exists = await readContract({
          chainId,
          address: address as Address,
          abi: PermaPassNFTRegistry.abi,
          functionName: "exists",
          args: [tokenId],
        });

        if (!exists) {
          return false;
        }

        const owner = await readContract({
          chainId,
          address: address as Address,
          abi: PermaPassNFTRegistry.abi,
          functionName: "ownerOf",
          args: [tokenId],
        });

        const walletAddress = walletClient.account.address;
        return owner === walletAddress;
      } catch (error) {
        console.error(`useNFTRegistry - Failed to read NFT owner:`, error);
        throw error;
      }
    };

    setCreateNFT(() => handleCreateNFT);
    setUpdateTokenURI(() => handleUpdateTokenURI);
    setDeleteNFT(() => handleDeleteNFT);
    setIsOwner(() => handleIsOwner);
  }, [walletClient, isError, isLoading]);

  const readNFTPassportHistory = useCallback(async (metadata: NFTPassportMetadata): Promise<PassportVersion[]> => {
    const { tokenId, chainId, address } = metadata;

    const publicClient = getPublicClient(chainId);

    try {
      let previousChange: bigint = await readContract({
        chainId,
        address: address as Address,
        abi: PermaPassNFTRegistry.abi,
        functionName: "changed",
        args: [tokenId],
      });

      const passportVersions: PassportVersion[] = [];
      while (previousChange) {
        const events = await publicClient.getContractEvents({
          address: address as Address,
          abi: PermaPassNFTRegistry.abi,
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
      console.error(`useNFTRegistry - Failed to read NFT passport history:`, error);
      throw error;
    }
  }, []);

  const isDeleted = useCallback(async (metadata: NFTPassportMetadata): Promise<boolean> => {
    const { tokenId, chainId, address } = metadata;

    try {
      const exists = await readContract({
        chainId,
        address: address as Address,
        abi: PermaPassNFTRegistry.abi,
        functionName: "exists",
        args: [tokenId],
      });

      return !exists;
    } catch (error) {
      console.error(`useNFTRegistry - Failed to read NFT owner:`, error);
      throw error;
    }
  }, []);

  return {
    nftRegistry: {
      createNFT,
      updateTokenURI,
      readNFTPassportHistory,
      deleteNFT,
      isDeleted,
      isOwner,
    },
  };
}
