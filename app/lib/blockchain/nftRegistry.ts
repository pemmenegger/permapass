import { PermaPassNFTRegistry } from "../../contracts/PermaPassNFTRegistry";
import { walletClient, hardhat, publicClient } from "./wagmi";
import { readContract, erc721ABI, watchContractEvent } from "@wagmi/core";
import { NFTPassportMetadata, PassportURIHistory } from "../../types";
import { Address } from "viem";

const createNFT = async (to: Address, tokenURI: string) => {
  const tokenIdPromise = new Promise<bigint>((resolve) => {
    console.log("createNFT - watching for event...");
    const unwatch = watchContractEvent(
      {
        chainId: hardhat.id,
        address: PermaPassNFTRegistry[hardhat.id].address,
        abi: PermaPassNFTRegistry[hardhat.id].abi,
        eventName: "Minted",
      },
      async (logs) => {
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
  });

  console.log(`createNFT - Minting NFT with tokenURI: ${tokenURI}...`);
  await walletClient.writeContract({
    address: PermaPassNFTRegistry[hardhat.id].address,
    abi: PermaPassNFTRegistry[hardhat.id].abi,
    functionName: "safeMint",
    args: [to, tokenURI],
  });
  console.log("createNFT - NFT minted!");

  const tokenId = await tokenIdPromise;
  return tokenId;
};

const updateTokenURI = async (tokenId: bigint, uri: string) => {
  console.log("setting token URI...");
  await walletClient.writeContract({
    address: PermaPassNFTRegistry[hardhat.id].address,
    abi: PermaPassNFTRegistry[hardhat.id].abi,
    functionName: "setTokenURI",
    args: [tokenId, uri],
  });
  console.log("Token URI set");
};

const readNFTPassportURI = async (metadata: NFTPassportMetadata) => {
  const passportURI = await readContract({
    chainId: metadata.chainId,
    address: metadata.address as Address,
    abi: erc721ABI,
    functionName: "tokenURI",
    args: [metadata.tokenId],
  });
  return passportURI;
};

const readNFTPassportURIHistory = async (metadata: NFTPassportMetadata) => {
  const { tokenId } = metadata;

  let previousChange: bigint = await readContract({
    chainId: hardhat.id,
    address: PermaPassNFTRegistry[hardhat.id].address,
    abi: PermaPassNFTRegistry[hardhat.id].abi,
    functionName: "changed",
    args: [tokenId],
  });

  const URIHistory: PassportURIHistory[] = [];
  while (previousChange) {
    const events = await publicClient.getContractEvents({
      address: metadata.address as Address,
      abi: PermaPassNFTRegistry[hardhat.id].abi,
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

export const nftRegistry = {
  createNFT,
  updateTokenURI,
  readNFTPassportURI,
  readNFTPassportURIHistory,
};
