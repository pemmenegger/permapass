import { walletClient, hardhat, publicClient } from "./wagmi";
import { readContract } from "@wagmi/core";
import { DIDPassportMetadata, PassportURIHistory } from "../../types";
import { api } from "./../web-api";
import { PermaPassDIDRegistry } from "../../contracts/PermaPassDIDRegistry";
import { generatePrivateKey, privateKeyToAccount, sign } from "viem/accounts";
import { Address, encodePacked, fromHex, keccak256, pad } from "viem";
import { stringToBytes, toHex } from "viem";

// we need this function because veramo does not have this possibility
// we used api because for simplicity and not rewriting the code (veramo dependencies conflict with wallet conection)
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

  console.log(`createDID transaction Hash: ${txHash}`);

  await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log("createDID transaction confirmed");

  return "did:ethr:hardhat:" + identity;
}

async function updateDIDService(didUrl: string, passportDataURI: string) {
  const identity = didUrl.split(":")[3];

  const service = {
    type: "ProductPassport",
    serviceEndpoint: passportDataURI as string,
  };

  let key = "did/svc/" + service.type;
  let value =
    typeof service.serviceEndpoint === "string" ? service.serviceEndpoint : JSON.stringify(service.serviceEndpoint);

  const attrNameBytes = stringToBytes(key);
  const attrNameBytesPadded = pad(attrNameBytes, { size: 32, dir: "right" });
  const attrName = toHex(attrNameBytesPadded);

  const attrValueBytes = stringToBytes(value);
  const attrValue = toHex(attrValueBytes);

  const txHash = await walletClient.writeContract({
    address: PermaPassDIDRegistry[hardhat.id].address,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "setAttribute",
    args: [identity as Address, attrName as Address, attrValue as Address, BigInt(86400)],
  });

  console.log(`updateDIDService transaction Hash: ${txHash}`);

  await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log("updateDIDService transaction confirmed");
}

const readDIDPassportURI = async (metadata: DIDPassportMetadata) => {
  const did = metadata.did;
  const registryAddress = PermaPassDIDRegistry[hardhat.id].address;
  // we use the api because veramo packages conflict with the wallet connection
  const didDocument = await api.veramo.resolveDID(did, registryAddress);
  // console.log("didDocument", JSON.stringify(didDocument, null, 2));

  // Filter ProductPassport services
  const passportServices = didDocument.service?.filter((service) => service.type === "ProductPassport") || [];

  if (passportServices.length === 0) {
    console.log("No ProductPassport services found.");
    throw new Error("No ProductPassport services found.");
  }

  let mostRecentService = passportServices[0];
  for (let service of passportServices) {
    const serviceCount = service.id.split("-").pop();
    if (!serviceCount) {
      console.log("Service count not found.");
      throw new Error("Service count not found.");
    }
    const mostRecentServiceCount = mostRecentService.id.split("-").pop();
    if (!mostRecentServiceCount) {
      console.log("Most recent service count not found.");
      throw new Error("Most recent service count not found.");
    }
    if (parseInt(serviceCount, 10) > parseInt(mostRecentServiceCount, 10)) {
      mostRecentService = service;
    }
  }
  const passportURI = mostRecentService.serviceEndpoint;
  return passportURI;
};

const readDIDPassportURIHistory = async (metadata: DIDPassportMetadata) => {
  const { did } = metadata;
  const identity = did.split(":")[3] as Address;

  let previousChange: bigint = await readContract({
    chainId: hardhat.id,
    address: PermaPassDIDRegistry[hardhat.id].address,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "changed",
    args: [identity],
  });

  const URIHistory: PassportURIHistory[] = [];
  while (previousChange) {
    const events = await publicClient.getContractEvents({
      address: metadata.address as Address,
      abi: PermaPassDIDRegistry[hardhat.id].abi,
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
      URIHistory.push({
        uri: fromHex(event.args.value!, "string"),
        timestamp: block.timestamp,
      });
    }

    const lastEvent = events[events.length - 1];
    previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
  }

  return URIHistory;
};

export const didRegistry = {
  createDID,
  updateDIDService,
  readDIDPassportURI,
  readDIDPassportURIHistory,
};
