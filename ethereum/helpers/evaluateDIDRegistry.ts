import { evaluateContract } from "./evaluateContract";
import { Address, PublicClient, encodePacked, fromHex, keccak256, pad, stringToBytes, toHex, zeroAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount, sign } from "viem/accounts";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const SERVICE_KEY = "did/svc/ProductPassport";

const getDIDServiceProperties = (testPassportDataURI: string) => {
  const value = testPassportDataURI;

  const attrNameBytes = stringToBytes(SERVICE_KEY);
  const attrNameBytesPadded = pad(attrNameBytes, { size: 32, dir: "right" });
  const attrName = toHex(attrNameBytesPadded);

  const attrValueBytes = stringToBytes(value);
  const attrValue = toHex(attrValueBytes);

  return {
    attrName,
    attrValue,
  };
};

const generateNewAccount = async () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey as Address);
  return { privateKey, identity: account.address };
};

export const evaluateDIDRegistry = async ({
  hre,
  testPassportDataURI,
  testUpdatedPassportDataURI,
}: {
  hre: HardhatRuntimeEnvironment;
  testPassportDataURI: string;
  testUpdatedPassportDataURI: string;
}) => {
  const DIDRegistryArtifact = await hre.artifacts.readArtifact("DIDRegistry");

  // Preparation: Generate a new private key and account for the construction product
  const { privateKey, identity } = await generateNewAccount();

  // Preparation: Compute the attribute name and value for the setAttribute function
  const { attrName: attrNameCreate, attrValue: attrValueCreate } = getDIDServiceProperties(testPassportDataURI);
  const { attrName: attrNameUpdate, attrValue: attrValueUpdate } = getDIDServiceProperties(testUpdatedPassportDataURI);

  await evaluateContract({
    contractName: "DIDRegistry",
    abi: DIDRegistryArtifact.abi,
    bytecode: DIDRegistryArtifact.bytecode,
    functions: {
      create: [
        async (contractAddress: Address, walletAddress: Address) => {
          const contract = await hre.viem.getContractAt("DIDRegistry", contractAddress);

          const identityOwner = identity;
          const newOwner = walletAddress;

          // computing signature with the construction product's private key
          // this allows the user to claim ownership of the construction product's identity
          const nonce = await contract.read.nonce([identityOwner]);
          const msgHash = keccak256(
            encodePacked(
              ["bytes1", "bytes1", "address", "uint", "address", "string", "address"],
              ["0x19", "0x00", contractAddress, nonce, identity, "changeOwner", newOwner]
            )
          );
          const signature = await sign({ hash: msgHash, privateKey });

          // claim ownership of the construction product's identity
          const txHash = await contract.write.changeOwnerSigned([
            identity,
            Number(signature.v),
            signature.r,
            signature.s,
            newOwner,
          ]);
          return { txHash, functionName: "changeOwnerSigned" };
        },
        async (contractAddress: Address) => {
          const contract = await hre.viem.getContractAt("DIDRegistry", contractAddress);
          const txHash = await contract.write.setAttribute([identity, attrNameCreate, attrValueCreate, BigInt(86400)]);
          return { txHash, functionName: "setAttribute" };
        },
      ],
      read: async (contractAddress: Address, publicClient: PublicClient) => {
        const contract = await hre.viem.getContractAt("DIDRegistry", contractAddress);
        let previousChange: bigint = await contract.read.changed([identity]);

        while (previousChange) {
          const [attributeChangedEvents, ownerChangedEvents] = await Promise.all([
            publicClient.getContractEvents({
              address: contractAddress,
              abi: DIDRegistryArtifact.abi,
              eventName: "DIDAttributeChanged",
              args: { identity },
              fromBlock: previousChange,
              toBlock: previousChange,
            }),
            publicClient.getContractEvents({
              address: contractAddress,
              abi: DIDRegistryArtifact.abi,
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
              if (attributeName === SERVICE_KEY) {
                console.log(`DIDRegistry read ${attributeName}: ${fromHex(value, "string")}`);
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

        return { functionName: "changed" };
      },
      update: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("DIDRegistry", contractAddress);
        const txHash = await contract.write.setAttribute([identity, attrNameUpdate, attrValueUpdate, BigInt(86400)]);
        return { txHash, functionName: "setAttribute" };
      },
      delete: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("DIDRegistry", contractAddress);
        const txHash = await contract.write.changeOwner([identity, zeroAddress]);
        return { txHash, functionName: "changeOwner" };
      },
    },
  });
};
