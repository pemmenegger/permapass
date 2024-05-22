import { useState, useEffect } from "react";
import { Address, useWalletClient } from "wagmi";
import { PermaPassDIDRegistry } from "../../contracts/PermaPassDIDRegistry";
import { readContract } from "@wagmi/core";
import { generatePrivateKey, privateKeyToAccount, sign } from "viem/accounts";
import { encodePacked, fromHex, keccak256, pad, stringToBytes, toHex } from "viem";
import { ArweaveURI, DIDPassportMetadata, PassportVersion } from "../../types";
import { getPublicClient } from "../../lib/wagmi";
import { fromDIDToIdentity } from "../../lib/utils";

export function useDIDRegistry() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const [createDID, setCreateDID] = useState<(() => Promise<DIDPassportMetadata>) | undefined>(undefined);
  const [addDIDService, setAddDIDService] = useState<
    ((didUrl: string, passportDataURI: ArweaveURI) => Promise<void>) | undefined
  >(undefined);

  useEffect(() => {
    if (!walletClient) {
      // console.error("useDIDRegistry - walletClient not available");
      return;
    }

    const chainId = walletClient.chain.id;
    const chainName = walletClient.chain.name;
    const contractInfo = PermaPassDIDRegistry[chainId as keyof typeof PermaPassDIDRegistry];

    if (!contractInfo) {
      console.error(`useDIDRegistry - Contract info not found for chain id: ${chainId}`);
      return;
    }

    const publicClient = getPublicClient(chainId);
    if (!publicClient) {
      throw new Error(`Unsupported chain id: ${chainId}`);
    }

    const handleCreateDID = async () => {
      try {
        const privateKey = generatePrivateKey();
        const account = privateKeyToAccount(privateKey as Address);
        const identityOwner = account.address;
        const registryAddress = contractInfo.address;

        const nonce = await readContract({
          chainId: chainId,
          address: registryAddress,
          abi: contractInfo.abi,
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
          address: contractInfo.address,
          abi: contractInfo.abi,
          functionName: "changeOwnerSigned",
          args: [identity, Number(sig.v), sig.r, sig.s, newOwner],
        });

        console.log(`createDID transaction Hash: ${txHash}`);

        await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log("createDID transaction confirmed");

        const metadata: DIDPassportMetadata = {
          type: "did",
          chainId,
          address: contractInfo.address,
          did: `did:ethr:${chainName.toLowerCase()}:${identity}`,
          serviceType: "ProductPassport",
        };

        return metadata;
      } catch (error) {
        console.error("Failed to create DID:", error);
        throw error;
      }
    };

    const handleAddDIDService = async (didUrl: string, passportDataURI: ArweaveURI) => {
      const identity = didUrl.split(":")[3];

      const key = "did/svc/ProductPassport";
      const value = passportDataURI;

      const attrNameBytes = stringToBytes(key);
      const attrNameBytesPadded = pad(attrNameBytes, { size: 32, dir: "right" });
      const attrName = toHex(attrNameBytesPadded);

      const attrValueBytes = stringToBytes(value);
      const attrValue = toHex(attrValueBytes);

      const txHash = await walletClient.writeContract({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: "setAttribute",
        args: [identity as Address, attrName as Address, attrValue as Address, BigInt(86400)],
      });

      console.log(`updateDIDService transaction Hash: ${txHash}`);

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("updateDIDService transaction confirmed");
    };

    setCreateDID(() => handleCreateDID);
    setAddDIDService(() => handleAddDIDService);
  }, [walletClient, isError, isLoading]);

  const readDIDPassportHistory = async (metadata: DIDPassportMetadata) => {
    const { did, chainId, address } = metadata;

    const publicClient = getPublicClient(chainId);
    if (!publicClient) {
      throw new Error(`Unsupported chain id: ${chainId}`);
    }

    const identity = fromDIDToIdentity(did);

    try {
      let previousChange: bigint = await readContract({
        chainId,
        address: address as Address,
        // TODO from metadata?
        abi: PermaPassDIDRegistry[chainId as keyof typeof PermaPassDIDRegistry].abi,
        functionName: "changed",
        args: [identity],
      });

      const passportVersions: PassportVersion[] = [];

      while (previousChange) {
        const events = await publicClient.getContractEvents({
          address: address as Address,
          // TODO from metadata?
          abi: PermaPassDIDRegistry[chainId as keyof typeof PermaPassDIDRegistry].abi,
          eventName: "DIDAttributeChanged",
          args: { identity },
          fromBlock: previousChange,
          toBlock: previousChange,
        });

        const block = await publicClient.getBlock({ blockNumber: previousChange });

        for (const event of events) {
          const name = fromHex(event.args.name!, "string").replace(/\0/g, "");
          if (name !== "did/svc/ProductPassport") {
            console.log("Attribute name is not ProductPassport, skipping.");
            continue;
          }

          passportVersions.push({
            uri: fromHex(event.args.value!, "string") as ArweaveURI,
            timestamp: block.timestamp,
          });
        }

        const lastEvent = events[events.length - 1];
        previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
      }

      return passportVersions;
    } catch (error) {
      console.error("Failed to read DID passport URI history:", error);
      throw error;
    }
  };

  return {
    didRegistry: {
      createDID,
      addDIDService,
      readDIDPassportHistory,
    },
  };
}
