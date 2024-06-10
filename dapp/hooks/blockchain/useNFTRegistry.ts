import { useState, useEffect } from "react";
import { Address, useWalletClient } from "wagmi";
import { NFTRegistry } from "../../contracts/NFTRegistry";
import { ArweaveURI, NFTPassportMetadata, PassportReadDetails } from "../../types";
import { getPublicClient } from "../../lib/wagmi";
import { zeroAddress } from "viem";
import { writeContractAndAwaitEvent } from "../../lib/utils";

export function useNFTRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [createNFT, setCreateNFT] = useState<((tokenURI: ArweaveURI) => Promise<NFTPassportMetadata>) | undefined>(
    undefined
  );
  const [updateTokenURI, setUpdateTokenURI] = useState<
    ((tokenId: bigint, tokenURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);
  const [deleteNFT, setDeleteNFT] = useState<((tokenId: bigint) => Promise<void>) | undefined>(undefined);
  const contractName = "NFTRegistry";

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const chainId = walletClient.chain.id;

    const contractAddress = NFTRegistry[chainId.toString() as keyof typeof NFTRegistry] as Address;
    if (!contractAddress) throw new Error(`useNFTRegistry - No contract address found for chainId: ${chainId}`);

    const publicClient = getPublicClient(chainId);

    const handleCreateNFT = async (tokenURI: ArweaveURI): Promise<NFTPassportMetadata> => {
      try {
        const to = walletClient.account.address;

        const writeContractFn = async () =>
          await walletClient.writeContract({
            address: contractAddress,
            abi: NFTRegistry.abi,
            functionName: "mintNFT",
            args: [to, tokenURI],
          });

        const eventName = "Minted";
        const eventWatcher = () => {
          let unwatch: (() => void) | undefined;
          const promise = new Promise<bigint>((resolve, reject) => {
            unwatch = publicClient.watchContractEvent({
              address: contractAddress,
              abi: NFTRegistry.abi,
              eventName,
              args: { to, uri: tokenURI },
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
        const writeContractFn = async () =>
          await walletClient.writeContract({
            address: contractAddress,
            abi: NFTRegistry.abi,
            functionName: "setTokenURI",
            args: [tokenId, tokenURI],
          });

        const eventName = "TokenURIChanged";
        const eventWatcher = () => {
          let unwatch: (() => void) | undefined;
          const promise = new Promise<void>((resolve) => {
            unwatch = publicClient.watchContractEvent({
              address: contractAddress,
              abi: NFTRegistry.abi,
              eventName,
              args: { tokenId },
              onLogs: (logs) => {
                for (const log of logs) {
                  console.log(`${contractName} - ${eventName} event received`);
                  if (log.args.uri === tokenURI) {
                    console.log(`${contractName} - ${eventName} event found with uri: ${tokenURI}`);
                    resolve();
                    return;
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
