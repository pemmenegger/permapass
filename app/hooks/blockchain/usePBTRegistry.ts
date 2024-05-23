import { useState, useEffect, useCallback } from "react";
import { Address, useWalletClient } from "wagmi";
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

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const chainId = walletClient.chain.id;

    const contractInfo = PermaPassPBTRegistry[chainId as keyof typeof PermaPassPBTRegistry];
    if (!contractInfo) throw new Error(`usePBTRegistry - Contract info not found for chain id: ${chainId}`);

    const publicClient = getPublicClient(chainId);
    if (!publicClient) throw new Error(`useNFTRegistry - Public client unsupported chain id: ${chainId}`);

    const handleCreatePBT = async (
      chipAddress: Address,
      signatureFromChip: Address,
      blockNumberUsedInSig: bigint,
      tokenURI: ArweaveURI
    ) => {
      try {
        // const tokenIdPromise = new Promise<bigint>((resolve, reject) => {
        //   console.log("Watching for PBTMint event...");
        //   const unwatch = watchContractEvent(
        //     {
        //       address: contractInfo.address,
        //       abi: contractInfo.abi,
        //       eventName: "PBTMint",
        //     },
        //     (logs) => {
        //       for (const log of logs.reverse()) {
        //         if (log.args.chipAddress === chipAddress) {
        //           console.log("PBTMint event detected:", log.args);
        //           resolve(log.args.tokenId!);
        //           unwatch();
        //           break;
        //         }
        //       }
        //     }
        //   );

        //   setTimeout(() => {
        //     unwatch();
        //     reject(new Error("PBTMint event watch timed out"));
        //   }, 60000);
        // });

        const txHash = await walletClient.writeContract({
          address: contractInfo.address,
          abi: contractInfo.abi,
          functionName: "mintPBT",
          args: [chipAddress, signatureFromChip, blockNumberUsedInSig, tokenURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const events = await publicClient.getContractEvents({
          address: contractInfo.address,
          abi: contractInfo.abi,
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
          address: contractInfo.address,
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
          address: contractInfo.address,
          abi: contractInfo.abi,
          functionName: "setTokenURI",
          args: [tokenId, tokenURI],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
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
    if (!publicClient) throw new Error(`useNFTRegistry - Public client unsupported chain id: ${chainId}`);

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
