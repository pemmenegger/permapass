import { useState, useEffect, useCallback } from "react";
import { Address, useWalletClient } from "wagmi";
import { PermaPassPBTRegistry } from "../contracts/PermaPassPBTRegistry";
import { readContract, watchContractEvent } from "@wagmi/core";
import { ArweaveURI, PBTPassportMetadata, PassportVersion } from "../types";
import { getPublicClient } from "../lib/wagmi";

export function usePBTRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [createPBT, setCreatePBT] = useState<
    ((chipAddress: Address, tokenURI: ArweaveURI) => Promise<PBTPassportMetadata>) | undefined
  >(undefined);
  const [updateTokenURI, setUpdateTokenURI] = useState<
    ((tokenId: bigint, tokenURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);

  useEffect(() => {
    if (!walletClient) {
      // console.error("usePBTRegistry - walletClient not available");
      return;
    }

    const chainId = walletClient.chain.id;
    const contractInfo = PermaPassPBTRegistry[chainId as keyof typeof PermaPassPBTRegistry];

    if (!contractInfo) {
      console.error(`usePBTRegistry - Contract info not found for chain id: ${chainId}`);
      return;
    }

    const publicClient = getPublicClient(chainId);
    if (!publicClient) {
      throw new Error(`Unsupported chain id: ${chainId}`);
    }

    const handleCreatePBT = async (chipAddress: Address, tokenURI: ArweaveURI) => {
      try {
        const tokenIdPromise = new Promise<bigint>((resolve, reject) => {
          console.log("Watching for PBTMint event...");
          const unwatch = watchContractEvent(
            {
              address: contractInfo.address,
              abi: contractInfo.abi,
              eventName: "PBTMint",
            },
            (logs) => {
              for (const log of logs.reverse()) {
                if (log.args.chipAddress === chipAddress) {
                  console.log("PBTMint event detected:", log.args);
                  resolve(log.args.tokenId!);
                  unwatch();
                  break;
                }
              }
            }
          );

          setTimeout(() => {
            unwatch();
            reject(new Error("PBTMint event watch timed out"));
          }, 60000);
        });

        console.log(`Minting PBT with tokenURI: ${tokenURI}...`);
        const txHash = await walletClient.writeContract({
          address: contractInfo.address,
          abi: contractInfo.abi,
          functionName: "mintPBT",
          args: [chipAddress, signatureFromChip, blockNumberUsedInSig, tokenURI],
        });
        console.log(`mintPBT transaction Hash: ${txHash}`);

        await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log("mintPBT transaction confirmed");
        console.log("PBT minted successfully.");

        const tokenId = await tokenIdPromise;

        const metadata: PBTPassportMetadata = {
          type: "pbt",
          chainId,
          address: contractInfo.address,
          tokenId,
        };

        return metadata;
      } catch (error) {
        console.error("Failed to mint PBT:", error);
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

    setCreatePBT(() => handleCreatePBT);
    setUpdateTokenURI(() => handleUpdateTokenURI);
  }, [walletClient, isError, isLoading]);

  const readPBTPassportHistory = useCallback(async (metadata: PBTPassportMetadata): Promise<PassportVersion[]> => {
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
        abi: PermaPassPBTRegistry[chainId as keyof typeof PermaPassPBTRegistry].abi,
        functionName: "changed",
        args: [tokenId],
      });

      const passportVersions: PassportVersion[] = [];
      while (previousChange) {
        const events = await publicClient.getContractEvents({
          address: address as Address,
          // TODO put abi on metadata?
          abi: PermaPassPBTRegistry[chainId as keyof typeof PermaPassPBTRegistry].abi,
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
      console.error("Failed to read PBT passport URI history:", error);
      throw error;
    }
  }, []);

  return {
    pbtRegistry: {
      createPBT,
      updateTokenURI,
      readPBTPassportHistory,
    },
  };
}
