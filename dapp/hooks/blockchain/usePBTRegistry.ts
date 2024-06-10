import { useState, useEffect } from "react";
import { Address, useWalletClient } from "wagmi";
import { PBTRegistry } from "../../contracts/PBTRegistry";
import { ArweaveURI, PBTPassportMetadata, PassportReadDetails } from "../../types";
import { getPublicClient } from "../../lib/wagmi";
import { HaLoNFCChipSignatureOutput } from "../useHaloNFCChip";
import { zeroAddress } from "viem";
import { writeContractAndAwaitEvent } from "../../lib/utils";

export function usePBTRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [createPBT, setCreatePBT] = useState<
    ((chipSignature: HaLoNFCChipSignatureOutput, tokenURI: ArweaveURI) => Promise<PBTPassportMetadata>) | undefined
  >(undefined);
  const [updateTokenURI, setUpdateTokenURI] = useState<
    ((tokenId: bigint, tokenURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);
  const [deletePBT, setDeletePBT] = useState<((tokenId: bigint) => Promise<void>) | undefined>(undefined);
  const contractName = "PBTRegistry";

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

        const writeContractFn = async () =>
          await walletClient.writeContract({
            address: contractAddress,
            abi: PBTRegistry.abi,
            functionName: "mintPBT",
            args: [chipAddress, signatureFromChip, blockNumberUsedInSig, tokenURI],
          });

        const eventName = "PBTMint";
        const eventWatcher = () => {
          let unwatch: (() => void) | undefined;
          const promise = new Promise<bigint>((resolve, reject) => {
            unwatch = publicClient.watchContractEvent({
              address: contractAddress,
              abi: PBTRegistry.abi,
              eventName,
              args: { chipAddress },
              onLogs: (logs) => {
                console.log(`${contractName} - ${eventName} event received`);
                if (logs.length !== 1) {
                  return reject(new Error(`${contractName} - Multiple or no ${eventName} events found for token URI`));
                }
                const tokenId = logs[0].args.tokenId;
                if (!tokenId) {
                  return reject(new Error(`${contractName} - ${eventName} event missing tokenId`));
                }
                console.log(`${contractName} - ${eventName} event found with tokenId: ${logs[0].args.tokenId}`);
                resolve(tokenId);
              },
            });
          });
          return { unwatch: unwatch!, promise };
        };

        const tokenId = await writeContractAndAwaitEvent<bigint>(
          publicClient,
          writeContractFn,
          eventWatcher,
          eventName,
          contractName
        );

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
        const writeContractFn = async () =>
          await walletClient.writeContract({
            address: contractAddress,
            abi: PBTRegistry.abi,
            functionName: "setTokenURI",
            args: [tokenId, tokenURI],
          });

        const eventName = "TokenURIChanged";
        const eventWatcher = () => {
          let unwatch: (() => void) | undefined;
          const promise = new Promise<void>((resolve) => {
            unwatch = publicClient.watchContractEvent({
              address: contractAddress,
              abi: PBTRegistry.abi,
              eventName,
              args: { tokenId },
              onLogs: (logs) => {
                for (const log of logs) {
                  console.log(`${contractName} - ${eventName} event received`);
                  if (log.args.uri === tokenURI) {
                    console.log(`${contractName} - ${eventName} event found with uri: ${tokenURI}`);
                    resolve();
                  }
                }
              },
            });
          });
          return { unwatch: unwatch!, promise };
        };

        await writeContractAndAwaitEvent<void>(publicClient, writeContractFn, eventWatcher, eventName, contractName);
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
