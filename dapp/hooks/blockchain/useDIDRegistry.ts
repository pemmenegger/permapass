import { useState, useEffect } from "react";
import { Address, useWalletClient } from "wagmi";
import { DIDRegistry } from "../../contracts/DIDRegistry";
import { readContract } from "@wagmi/core";
import { generatePrivateKey, privateKeyToAccount, sign } from "viem/accounts";
import { encodePacked, fromHex, keccak256, pad, stringToBytes, toHex, zeroAddress } from "viem";
import { ArweaveURI, DIDPassportMetadata, PassportReadDetails } from "../../types";
import { getPublicClient } from "../../lib/wagmi";
import { fromDIDToIdentity } from "../../lib/utils";

export function useDIDRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [createDID, setCreateDID] = useState<(() => Promise<DIDPassportMetadata>) | undefined>(undefined);
  const [addDIDService, setAddDIDService] = useState<
    ((didUrl: string, passportDataURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);
  const [deleteDID, setDeleteDID] = useState<((didUrl: string) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const chainId = walletClient.chain.id;
    const chainName = walletClient.chain.name;

    const contractAddress = DIDRegistry[chainId.toString() as keyof typeof DIDRegistry] as Address;
    if (!contractAddress) throw new Error(`useDIDRegistry - No contract address found for chainId: ${chainId}`);

    const publicClient = getPublicClient(chainId);

    const handleCreateDID = async () => {
      try {
        // generate new blockchain address
        const privateKey = generatePrivateKey();
        const account = privateKeyToAccount(privateKey as Address);

        const identity = account.address;
        const identityOwner = account.address;
        const newOwner = walletClient.account.address;

        const nonce = await readContract({
          chainId: chainId,
          address: contractAddress,
          abi: DIDRegistry.abi,
          functionName: "nonce",
          args: [identityOwner],
        });

        const msgHash = keccak256(
          encodePacked(
            ["bytes1", "bytes1", "address", "uint", "address", "string", "address"],
            ["0x19", "0x00", contractAddress, nonce, identity, "changeOwner", newOwner]
          )
        );

        const signature = await sign({ hash: msgHash, privateKey });

        const ownerChangedEvent = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Event DIDOwnerChanged not received within 60 seconds"));
            unwatch?.();
          }, 60000); // 60 seconds

          const unwatch = publicClient.watchContractEvent({
            address: contractAddress,
            abi: DIDRegistry.abi,
            eventName: "DIDOwnerChanged",
            args: { identity },
            onLogs: (logs) => {
              for (const log of logs) {
                if (log.args.owner === newOwner) {
                  clearTimeout(timeout);
                  resolve();
                  unwatch?.();
                  break;
                }
              }
            },
          });
        });

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: DIDRegistry.abi,
          functionName: "changeOwnerSigned",
          args: [identity, Number(signature.v), signature.r, signature.s, newOwner],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        await ownerChangedEvent;

        const metadata: DIDPassportMetadata = {
          type: "did",
          chainId,
          address: contractAddress,
          did: `did:ethr:${chainName.toLowerCase()}:${identity}`,
          serviceType: "ProductPassport",
        };

        return metadata;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    const handleAddDIDService = async (did: string, passportDataURI: ArweaveURI) => {
      try {
        const identity = fromDIDToIdentity(did);

        const key = "did/svc/ProductPassport";
        const value = passportDataURI;

        const attrNameBytes = stringToBytes(key);
        const attrNameBytesPadded = pad(attrNameBytes, { size: 32, dir: "right" });
        const attrName = toHex(attrNameBytesPadded);

        const attrValueBytes = stringToBytes(value);
        const attrValue = toHex(attrValueBytes);

        const attributeChangedEvent = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Event DIDAttributeChanged not received within 60 seconds"));
            unwatch?.();
          }, 60000); // 60 seconds

          const unwatch = publicClient.watchContractEvent({
            address: contractAddress,
            abi: DIDRegistry.abi,
            eventName: "DIDAttributeChanged",
            args: { identity },
            onLogs: (logs) => {
              for (const log of logs) {
                if (log.args.name === attrName && log.args.value === attrValue) {
                  clearTimeout(timeout);
                  resolve();
                  unwatch?.();
                  break;
                }
              }
            },
          });
        });

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: DIDRegistry.abi,
          functionName: "setAttribute",
          args: [identity as Address, attrName as Address, attrValue as Address, BigInt(86400)],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        await attributeChangedEvent;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    const handleDeleteDIDService = async (did: string) => {
      try {
        // change the ownership, i.e. controller to the zero address
        const newOwner = zeroAddress;
        const identity = fromDIDToIdentity(did);

        const ownerChangedEvent = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Event DIDOwnerChanged not received within 60 seconds"));
            unwatch?.();
          }, 60000); // 60 seconds

          const unwatch = publicClient.watchContractEvent({
            address: contractAddress,
            abi: DIDRegistry.abi,
            eventName: "DIDOwnerChanged",
            args: { identity },
            onLogs: (logs) => {
              for (const log of logs) {
                if (log.args.owner === newOwner) {
                  clearTimeout(timeout);
                  resolve();
                  unwatch?.();
                  break;
                }
              }
            },
          });
        });

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: DIDRegistry.abi,
          functionName: "changeOwner",
          args: [identity, newOwner],
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        await ownerChangedEvent;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    setCreateDID(() => handleCreateDID);
    setAddDIDService(() => handleAddDIDService);
    setDeleteDID(() => handleDeleteDIDService);
  }, [walletClient, isError, isLoading]);

  const readDIDPassportHistory = async (metadata: DIDPassportMetadata) => {
    const { did, chainId, address } = metadata;
    const publicClient = getPublicClient(chainId);
    const identity = fromDIDToIdentity(did);

    try {
      const passportVersions: PassportReadDetails[] = [];

      let previousChange: bigint = await readContract({
        chainId,
        address: address as Address,
        abi: DIDRegistry.abi,
        functionName: "changed",
        args: [identity],
      });

      while (previousChange) {
        const block = await publicClient.getBlock({ blockNumber: previousChange });

        const [attributeChangedEvents, ownerChangedEvents] = await Promise.all([
          publicClient.getContractEvents({
            address: address as Address,
            abi: DIDRegistry.abi,
            eventName: "DIDAttributeChanged",
            args: { identity },
            fromBlock: previousChange,
            toBlock: previousChange,
          }),
          publicClient.getContractEvents({
            address: address as Address,
            abi: DIDRegistry.abi,
            eventName: "DIDOwnerChanged",
            args: { identity },
            fromBlock: previousChange,
            toBlock: previousChange,
          }),
        ]);

        if (attributeChangedEvents.length > 0) {
          for (const event of attributeChangedEvents) {
            const { name, value } = event.args;
            if (!name || !value) {
              throw new Error(`Missing name or value in attributeChanged event: ${event.args}`);
            }
            const attributeName = fromHex(name, "string").replace(/\0/g, "");
            if (attributeName === "did/svc/ProductPassport") {
              passportVersions.push({
                uri: fromHex(value, "string") as ArweaveURI,
                blockTimestamp: block.timestamp,
              });
            }
          }
          const lastEvent = attributeChangedEvents[attributeChangedEvents.length - 1];
          previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
        } else if (ownerChangedEvents.length > 0) {
          const lastEvent = ownerChangedEvents[ownerChangedEvents.length - 1];
          previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
        } else {
          previousChange = 0n;
        }
      }

      return passportVersions;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const ownerOf = async (metadata: DIDPassportMetadata): Promise<Address> => {
    const { did, chainId, address } = metadata;
    const identity = fromDIDToIdentity(did);

    try {
      return await readContract({
        chainId,
        address: address as Address,
        abi: DIDRegistry.abi,
        functionName: "owners",
        args: [identity],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    didRegistry: {
      createDID,
      addDIDService,
      deleteDID,
      readDIDPassportHistory,
      ownerOf,
    },
  };
}
