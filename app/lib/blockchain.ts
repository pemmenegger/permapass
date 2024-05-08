import { PermaPassNFTRegistry } from "../contracts/PermaPassNFTRegistry";
import { walletClient, hardhat, publicClient } from "./wagmi";
import { readContract, erc721ABI, watchContractEvent } from "@wagmi/core";
import { NFTPassportMetadata } from "../types";
import { api } from "./web-api";
import { PermaPassDIDRegistry } from "../contracts/PermaPassDIDRegistry";
import { generatePrivateKey, privateKeyToAccount, sign } from "viem/accounts";
import { Address, encodePacked, keccak256 } from "viem";

const readNFTPassport = async (metadata: NFTPassportMetadata) => {
  const passportURI = await readContract({
    chainId: metadata.chainId,
    address: metadata.address as Address,
    abi: erc721ABI,
    functionName: "tokenURI",
    args: [metadata.tokenId],
  });
  const passportURL = api.arweave.fromURIToURL(passportURI as string);
  const passport = await api.arweave.fetchPassport(passportURL);
  return passport;
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

async function createDID() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey as Address);

  const identityOwner = account.address;
  const registryAddress = PermaPassDIDRegistry[hardhat.id].address;
  const nonce = await readContract({
    chainId: hardhat.id,
    address: registryAddress,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "nonce",
    args: [identityOwner],
  });
  const identity = account.address;
  const newOwner = walletClient.account.address;

  const msgHash = keccak256(
    encodePacked(
      ["bytes1", "bytes1", "address", "uint", "address", "string", "address"],
      ["0x19", "0x00", registryAddress, nonce, identity, "changeOwner", newOwner]
    )
  );
  const sig = await sign({ hash: msgHash, privateKey });

  const txHash = await walletClient.writeContract({
    address: PermaPassDIDRegistry[hardhat.id].address,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "changeOwnerSigned",
    args: [identity, Number(sig.v), sig.r, sig.s, newOwner],
  });

  console.log(`Transaction Hash: ${txHash}`);

  await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log("Transaction confirmed");

  return "did:ethr:hardhat:" + identity;
}

export const blockchain = {
  readNFTPassport,
  mintNFT,
  setTokenURI,
  createDID,
};
