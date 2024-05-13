import { PermaPassNFTRegistry } from "../../contracts/PermaPassNFTRegistry";
import { walletClient, hardhat } from "./../wagmi";
import { readContract, erc721ABI, watchContractEvent } from "@wagmi/core";
import { NFTPassportMetadata } from "../../types";
import { Address } from "viem";

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

const mintNFT = async (to: Address, tokenURI: string) => {
  const tokenIdPromise = new Promise<bigint>((resolve) => {
    console.log("mintNFT - watching for event...");
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
          console.log("mintNFT - event detected");
          if (log.args.to === to && log.args.uri === tokenURI) {
            console.log("mintNFT - Token ID received:", log.args.tokenId);
            resolve(log.args.tokenId!);
            unwatch?.();
            console.log("mintNFT - event unwatched");
            break;
          }
        }
      }
    );
  });

  console.log(`mintNFT - Minting NFT with tokenURI: ${tokenURI}...`);
  await walletClient.writeContract({
    address: PermaPassNFTRegistry[hardhat.id].address,
    abi: PermaPassNFTRegistry[hardhat.id].abi,
    functionName: "safeMint",
    args: [to, tokenURI],
  });
  console.log("mintNFT - NFT minted!");

  const tokenId = await tokenIdPromise;
  return tokenId;
};

const setTokenURI = async (tokenId: bigint, uri: string) => {
  console.log("setting token URI...");
  await walletClient.writeContract({
    address: PermaPassNFTRegistry[hardhat.id].address,
    abi: PermaPassNFTRegistry[hardhat.id].abi,
    functionName: "setTokenURI",
    args: [tokenId, uri],
  });
  console.log("Token URI set");
};

export const nftRegistry = {
  readNFTPassportURI,
  mintNFT,
  setTokenURI,
};
