import { walletClient, hardhat, publicClient } from "./wagmi";
import { readContract } from "@wagmi/core";
import { DIDPassportMetadata } from "../../types";
import { api } from "./../web-api";
import { PermaPassDIDRegistry } from "../../contracts/PermaPassDIDRegistry";
import { generatePrivateKey, privateKeyToAccount, sign } from "viem/accounts";
import { Address, encodePacked, keccak256, pad } from "viem";
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
    type: "LinkedDomains",
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
  const passportURI = didDocument.service?.find((service) => service.type === "LinkedDomains")?.serviceEndpoint;
  return passportURI;
};

export const didRegistry = {
  createDID,
  updateDIDService,
  readDIDPassportURI,
};
