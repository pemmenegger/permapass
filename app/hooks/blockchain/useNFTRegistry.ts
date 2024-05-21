import { useState, useEffect, useCallback } from "react";
import { Address, useWalletClient } from "wagmi";
import { PermaPassNFTRegistry } from "../../contracts/PermaPassNFTRegistry";
import { readContract, watchContractEvent } from "@wagmi/core";
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

  useEffect(() => {
    if (!walletClient) {
      // console.error("useNFTRegistry - walletClient not available");
      return;
    }

    const chainId = walletClient.chain.id;
    const contractInfo = PermaPassNFTRegistry[chainId as keyof typeof PermaPassNFTRegistry];

    if (!contractInfo) {
      console.error(`useNFTRegistry - Contract info not found for chain id: ${chainId}`);
      return;
    }

    const publicClient = getPublicClient(chainId);
    if (!publicClient) {
      throw new Error(`Unsupported chain id: ${chainId}`);
    }

    const handleCreateNFT = async (tokenURI: ArweaveURI) => {
      try {
        const to = walletClient.account.address;
        const tokenIdPromise = new Promise<bigint>((resolve, reject) => {
          console.log("Watching for mint event...");
          const unwatch = watchContractEvent(
            {
              address: contractInfo.address,
              abi: contractInfo.abi,
              eventName: "Minted",
            },
            (logs) => {
              for (const log of logs.reverse()) {
                if (log.args.to === to && log.args.uri === tokenURI) {
                  console.log("Mint event detected:", log.args.tokenId);
                  resolve(log.args.tokenId!);
                  unwatch();
                  break;
                }
              }
            }
          );

          setTimeout(() => {
            unwatch();
            reject(new Error("Mint event watch timed out"));
          }, 60000);
        });

        console.log(`Minting NFT with tokenURI: ${tokenURI}...`);
        const txHash = await walletClient.writeContract({
          address: contractInfo.address,
          abi: contractInfo.abi,
          functionName: "safeMint",
          args: [to, tokenURI],
        });
        console.log(`createDID transaction Hash: ${txHash}`);

        await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log("createDID transaction confirmed");
        console.log("NFT minted successfully.");

        const tokenId = await tokenIdPromise;

        const metadata: NFTPassportMetadata = {
          type: "nft",
          chainId,
          address: contractInfo.address,
          tokenId,
        };

        return metadata;
      } catch (error) {
        console.error("Failed to mint NFT:", error);
        throw error;
      }
    };

    const handleUpdateTokenURI = async (tokenId: bigint, tokenURI: ArweaveURI) => {
      try {
        console.log("Updating token URI...");
        const txHash = await walletClient.writeContract({
          address: contractInfo.address,
          abi: contractInfo.abi,
          functionName: "setTokenURI",
          args: [tokenId, tokenURI],
        });
        console.log(`setTokenURI transaction Hash: ${txHash}`);

        await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log("setTokenURI transaction confirmed");
        console.log("Token URI updated successfully.");
      } catch (error) {
        console.error("Failed to update token URI:", error);
      }
    };

    setCreateNFT(() => handleCreateNFT);
    setUpdateTokenURI(() => handleUpdateTokenURI);
  }, [walletClient, isError, isLoading]);

  const readNFTPassportHistory = useCallback(async (metadata: NFTPassportMetadata): Promise<PassportVersion[]> => {
    const { tokenId, chainId, address } = metadata;

    const publicClient = getPublicClient(chainId);
    if (!publicClient) {
      throw new Error(`Unsupported chain id: ${chainId}`);
    }

    try {
      let previousChange: bigint = await readContract({
        chainId,
        address: address as Address,
        // TODO put abi on metadata?
        abi: PermaPassNFTRegistry[chainId as keyof typeof PermaPassNFTRegistry].abi,
        functionName: "changed",
        args: [tokenId],
      });

      const passportVersions: PassportVersion[] = [];
      while (previousChange) {
        const events = await publicClient.getContractEvents({
          address: address as Address,
          // TODO put abi on metadata?
          abi: PermaPassNFTRegistry[chainId as keyof typeof PermaPassNFTRegistry].abi,
          eventName: "TokenURIChanged",
          args: { tokenId },
          fromBlock: previousChange,
          toBlock: previousChange,
        });

        const block = await publicClient.getBlock({ blockNumber: previousChange });
        events.forEach((event) => {
          passportVersions.push({
            uri: event.args.uri! as ArweaveURI,
            timestamp: block.timestamp,
            sender: event.args.sender!,
          });
        });

        const lastEvent = events[events.length - 1];
        previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
      }

      return passportVersions;
    } catch (error) {
      console.error("Failed to read NFT passport URI history:", error);
      throw error;
    }
  }, []);

  return {
    nftRegistry: {
      createNFT,
      updateTokenURI,
      readNFTPassportHistory,
    },
  };
}
