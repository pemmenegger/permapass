import { useState, useEffect } from "react";
import { Address, useWalletClient } from "wagmi";
import { PermaPassNFTRegistry } from "../contracts/PermaPassNFTRegistry";
import { readContract, watchContractEvent } from "@wagmi/core";
import { NFTPassportMetadata, PassportURIHistory } from "../types";
import { hardhatClient } from "../lib/blockchain/wagmi";
import { hardhat } from "viem/chains";

export function useNFTRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [updateTokenURI, setUpdateTokenURI] = useState<((tokenId: bigint, uri: string) => Promise<void>) | undefined>(
    undefined
  );
  const [createNFT, setCreateNFT] = useState<((to: Address, tokenURI: string) => Promise<bigint>) | undefined>(
    undefined
  );

  useEffect(() => {
    if (!walletClient) {
      console.log("useNFTRegistry - walletClient not available");
      console.log(`useNFTRegistry walletClient: ${walletClient}`);
      return;
    }

    const contractInfo = PermaPassNFTRegistry[walletClient.chain.id as keyof typeof PermaPassNFTRegistry];
    if (!contractInfo) {
      console.log("useNFTRegistry - Contract info not found for chain id:", walletClient.chain.id);
      return;
    }

    const updateTokenURI = async (tokenId: bigint, uri: string) => {
      console.log("updateTokenURI - setting token URI...");
      await walletClient.writeContract({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: "setTokenURI",
        args: [tokenId, uri],
      });
      console.log("updateTokenURI - Token URI set");
    };
    setUpdateTokenURI(() => updateTokenURI);

    const createNFT = async (to: Address, tokenURI: string) => {
      const tokenIdPromise = new Promise<bigint>((resolve, reject) => {
        console.log("createNFT - watching for event...");
        const unwatch = watchContractEvent(
          {
            address: contractInfo.address,
            abi: contractInfo.abi,
            eventName: "Minted",
          },
          (logs) => {
            // if multiple, most recent first
            logs.reverse();
            for (const log of logs) {
              console.log("createNFT - event detected");
              if (log.args.to === to && log.args.uri === tokenURI) {
                console.log("createNFT - Token ID received:", log.args.tokenId);
                resolve(log.args.tokenId!);
                unwatch?.();
                console.log("createNFT - event unwatched");
                break;
              }
            }
          }
        );

        setTimeout(() => {
          unwatch?.();
          reject(new Error("createNFT - Event watch timed out"));
        }, 60000); // 60 seconds timeout
      });

      console.log(`createNFT - Minting NFT with tokenURI: ${tokenURI}...`);
      await walletClient.writeContract({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: "safeMint",
        args: [to, tokenURI],
      });
      console.log("createNFT - NFT minted!");

      const tokenId = await tokenIdPromise;
      return tokenId;
    };
    setCreateNFT(() => createNFT);
  }, [walletClient, isError, isLoading]);

  const readNFTPassportURIHistory = async (metadata: NFTPassportMetadata) => {
    const { tokenId } = metadata;

    let publicClient;
    switch (metadata.chainId) {
      case hardhat.id:
        publicClient = hardhatClient;
        break;
      default:
        throw new Error(`Unsupported chain id: ${metadata.chainId}`);
    }

    let previousChange: bigint = await readContract({
      chainId: metadata.chainId,
      address: metadata.address as Address,
      // TODO: use abi from metadata?
      abi: PermaPassNFTRegistry[metadata.chainId as keyof typeof PermaPassNFTRegistry].abi,
      functionName: "changed",
      args: [tokenId],
    });

    const URIHistory: PassportURIHistory[] = [];
    while (previousChange) {
      const events = await publicClient.getContractEvents({
        address: metadata.address as Address,
        // TODO: use abi from metadata?
        abi: PermaPassNFTRegistry[metadata.chainId as keyof typeof PermaPassNFTRegistry].abi,
        eventName: "TokenURIChanged",
        args: { tokenId },
        fromBlock: previousChange,
        toBlock: previousChange,
      });

      const block = await publicClient.getBlock({ blockNumber: previousChange });

      for (const event of events) {
        URIHistory.push({
          uri: event.args.uri!,
          timestamp: block.timestamp,
          version: event.args.version!,
          sender: event.args.sender!,
        });
      }

      const lastEvent = events[events.length - 1];
      previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
    }

    return URIHistory;
  };

  return {
    nftRegistry: {
      updateTokenURI,
      createNFT,
      readNFTPassportURIHistory,
    },
  };
}
