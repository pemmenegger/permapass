import { PermaPassNFTRegistry } from "../contracts/PermaPassNFTRegistry";
import { walletClient, hardhat, initWalletClient } from "./wagmi";
import { readContract, erc721ABI, watchContractEvent } from "@wagmi/core";
import { NFTPassportMetadata } from "../types";
import { api } from "./web-api";
import { PermaPassDIDRegistry } from "../contracts/PermaPassDIDRegistry";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Hash, Address, encodePacked, keccak256, hexToSignature } from "viem";
import { ethers } from "ethers";
import config from "./config";
import { Signature } from "ethers";
import { hashMessage } from "@ethersproject/hash";

const readNFTPassport = async (metadata: NFTPassportMetadata) => {
  const passportURI = await readContract({
    chainId: metadata.chainId,
    address: metadata.address as Address,
    abi: erc721ABI,
    functionName: "tokenURI",
    args: [metadata.tokenId],
  });
  const passportURL = api.arweave.fromURIToURL(passportURI as string);
  const passport = await api.arweave.fetchPassport(passportURL);
  return passport;
};

const mintNFT = async (to: Address, tokenURI: string) => {
  const tokenIdPromise = new Promise<bigint>((resolve) => {
    console.log("mintNFT - watching for event...");
    const unwatch = watchContractEvent(
      {
        chainId: hardhat.id,
        address: PermaPassNFTRegistry[hardhat.id].address,
        abi: PermaPassNFTRegistry[hardhat.id].abi,
        eventName: "Minted",
      },
      async (logs) => {
        // if multiple, most recent first
        logs.reverse();
        for (const log of logs) {
          console.log("mintNFT - event detected");
          if (log.args.to === to && log.args.uri === tokenURI) {
            console.log("mintNFT - Token ID received:", log.args.tokenId);
            resolve(log.args.tokenId!);
            unwatch?.();
            console.log("mintNFT - event unwatched");
            break;
          }
        }
      }
    );
  });

  console.log(`mintNFT - Minting NFT with tokenURI: ${tokenURI}...`);
  await walletClient.writeContract({
    address: PermaPassNFTRegistry[hardhat.id].address,
    abi: PermaPassNFTRegistry[hardhat.id].abi,
    functionName: "safeMint",
    args: [to, tokenURI],
  });
  console.log("mintNFT - NFT minted!");

  const tokenId = await tokenIdPromise;
  return tokenId;
};

const setTokenURI = async (tokenId: bigint, uri: string) => {
  console.log("setting token URI...");
  await walletClient.writeContract({
    address: PermaPassNFTRegistry[hardhat.id].address,
    abi: PermaPassNFTRegistry[hardhat.id].abi,
    functionName: "setTokenURI",
    args: [tokenId, uri],
  });
  console.log("Token URI set");
};

const createDIDWagmi = async () => {
  // 1. create account for object
  const privateKey = generatePrivateKey();
  const accountClient = initWalletClient(privateKey);

  // 2. create signature to allow creator to claim ownership
  const registryAddress = PermaPassDIDRegistry[hardhat.id].address;
  const identity = accountClient.account.address;
  const identityOwner = await readContract({
    chainId: hardhat.id,
    address: registryAddress,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "identityOwner",
    args: [identity],
  });
  const nonceCurrentOwner = await readContract({
    chainId: hardhat.id,
    address: registryAddress,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "nonce",
    args: [identityOwner],
  });
  const newOwner = walletClient.account.address;

  console.log("---");
  console.log("identity:", identity);
  console.log("identityOwner:", identityOwner);
  console.log("registryAddress:", registryAddress);
  console.log("nonceCurrentOwner:", nonceCurrentOwner);
  console.log("newOwner:", newOwner);
  const viemHash = keccak256(
    encodePacked(
      ["bytes1", "bytes1", "address", "uint256", "address", "string", "address"],
      ["0x19", "0x00", registryAddress, nonceCurrentOwner, identity, "changeOwner", newOwner]
    )
  );
  console.log("viemHash:", viemHash);
  console.log("---");

  // const hexSignature = await accountClient.signMessage({
  //   message: { raw: viemHash },
  // });

  const hexSignature = await accountClient.signMessage({
    message: viemHash,
  });

  console.log("hexSignature:", hexSignature);

  const { r, s, v } = hexToSignature(hexSignature);

  const sigR = r;
  const sigS = s;
  const sigV = v;

  console.log("sigR:", sigR);
  console.log("sigS:", sigS);
  console.log("sigV:", sigV);

  // 2. change owner of this acount (contract)
  await walletClient.writeContract({
    address: PermaPassDIDRegistry[hardhat.id].address,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "changeOwnerSigned",
    args: [identity, Number(sigV), sigR, sigS, newOwner],
  });

  // 3. set arweave txid as service endpoint (contract)

  return "did:ethr:hardhat:" + identity;
};

// const createDID = async () => {
//   // 1. create account for object
//   const privateKey = generatePrivateKey();
//   const account = privateKeyToAccount(privateKey as Address);

//   // 2. create signature to allow creator to claim ownership
//   const registryAddress = PermaPassDIDRegistry[hardhat.id].address;
//   const identity = account.address;
//   const identityOwner = await readContract({
//     chainId: hardhat.id,
//     address: registryAddress,
//     abi: PermaPassDIDRegistry[hardhat.id].abi,
//     functionName: "identityOwner",
//     args: [identity],
//   });
//   const nonceCurrentOwner = await readContract({
//     chainId: hardhat.id,
//     address: registryAddress,
//     abi: PermaPassDIDRegistry[hardhat.id].abi,
//     functionName: "nonce",
//     args: [identityOwner],
//   });
//   const newOwner = walletClient.account.address;

//   console.log("###############################");
//   console.log("identity:", identity);
//   console.log("identityOwner:", identityOwner);
//   console.log("registryAddress:", registryAddress);
//   console.log("nonceCurrentOwner:", nonceCurrentOwner);
//   console.log("newOwner:", newOwner);

//   // ethers
//   console.log("---");
//   const ethersProvider = new ethers.providers.JsonRpcProvider(config.HARDHAT_RPC_URL);
//   const etherSigner = new ethers.Wallet(privateKey, ethersProvider);
//   console.log("etherSigner:", etherSigner.address);
//   const ethersHash = ethers.utils.solidityKeccak256(
//     ["bytes1", "bytes1", "address", "uint", "address", "string", "address"],
//     ["0x19", "0x00", registryAddress, nonceCurrentOwner, identity, "changeOwner", newOwner]
//   );
//   console.log("ethersHash:", ethersHash);
//   const messageToSign = ethers.utils.arrayify(ethers.utils.hashMessage(ethers.utils.arrayify(ethersHash)));
//   const ethersFlatSig = await etherSigner.signMessage(messageToSign);
//   const ethersSig = ethers.utils.splitSignature(ethersFlatSig);
//   const ethersSigV = ethersSig.v;
//   const ethersSigR = ethersSig.r;
//   const ethersSigS = ethersSig.s;
//   console.log("ethersSigV:", ethersSigV);
//   console.log("ethersSigR:", ethersSigR);
//   console.log("ethersSigS:", ethersSigS);

//   // viem
//   console.log("---");
//   const viemClient = initWalletClient(privateKey);
//   console.log("viemClient:", viemClient.account.address);
//   const viemHash = keccak256(
//     encodePacked(
//       ["bytes1", "bytes1", "address", "uint", "address", "string", "address"],
//       ["0x19", "0x00", registryAddress, nonceCurrentOwner, identity, "changeOwner", newOwner]
//     )
//   );
//   console.log("viemHash:", viemHash);
//   const viemHexSignature = await viemClient.signMessage({
//     message: { raw: viemHash },
//   });
//   const viemSig = hexToSignature(viemHexSignature);
//   const viemSigV = Number(viemSig.v);
//   const viemSigR = viemSig.r;
//   const viemSigS = viemSig.s;
//   console.log("viemSigV:", viemSigV);
//   console.log("viemSigR:", viemSigR);
//   console.log("viemSigS:", viemSigS);

//   console.log("---");
//   const testHash = await readContract({
//     chainId: hardhat.id,
//     address: PermaPassDIDRegistry[hardhat.id].address,
//     abi: PermaPassDIDRegistry[hardhat.id].abi,
//     functionName: "testHash",
//     args: [identity, newOwner],
//   });
//   if (viemHash === testHash) {
//     console.log("viemHash and testHash match");
//   }
//   if (ethersHash === testHash) {
//     console.log("ethersHash and testHash match");
//   }

//   console.log("---");
//   const viemSignature = ethers.utils.joinSignature({ r: viemSigR, s: viemSigS, v: viemSigV });
//   const viemSigner = ethers.utils.recoverAddress(viemHash, viemSignature);
//   console.log(`Resolved viemSigner   ${viemSigner}`);
//   const ethersSignature = ethers.utils.joinSignature({ r: ethersSigR, s: ethersSigS, v: ethersSigV });
//   const ethersSigner = ethers.utils.recoverAddress(ethersHash, ethersSignature);
//   console.log(`Resolved ethersSigner ${ethersSigner}`);
//   const testSigner = await readContract({
//     chainId: hardhat.id,
//     address: PermaPassDIDRegistry[hardhat.id].address,
//     abi: PermaPassDIDRegistry[hardhat.id].abi,
//     functionName: "testSignature",
//     args: [viemSigV, viemSigR, viemSigS, viemHash],
//   });
//   console.log(`Resolved testSigner   ${testSigner}`);
//   console.log(`IdentityOwner         ${identityOwner}`);

//   if (identityOwner !== testSigner) {
//     console.log("FAILED: identityOwner !== testSigner");
//   } else {
//     console.log("PASSED: identityOwner === testSigner");
//   }

//   await walletClient.writeContract({
//     address: PermaPassDIDRegistry[hardhat.id].address,
//     abi: PermaPassDIDRegistry[hardhat.id].abi,
//     functionName: "changeOwnerSigned",
//     args: [identity, viemSigV, viemSigR, viemSigS, newOwner],
//   });

//   return "did:ethr:hardhat:" + identity;
// };

const createDIDOld = async () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey as Address);

  const registryAddress = PermaPassDIDRegistry[hardhat.id].address;
  const identity = account.address;
  const identityOwner = await readContract({
    chainId: hardhat.id,
    address: registryAddress,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "identityOwner",
    args: [identity],
  });
  const nonceCurrentOwner = await readContract({
    chainId: hardhat.id,
    address: registryAddress,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "nonce",
    args: [identityOwner],
  });
  const newOwner = walletClient.account.address;

  console.log("###############################");

  const ethersProvider = new ethers.providers.JsonRpcProvider(config.HARDHAT_RPC_URL);
  const etherSigner = new ethers.Wallet(privateKey, ethersProvider);

  console.log(`init - identity:      ${identity}`);
  console.log(`init - identityOwner: ${identityOwner}`);
  console.log(`init - signer:        ${etherSigner.address}`);

  const ethersHash = ethers.utils.solidityKeccak256(
    ["bytes1", "bytes1", "address", "uint", "address", "string", "address"],
    ["0x19", "0x00", registryAddress, nonceCurrentOwner, identity, "changeOwner", newOwner]
  );

  // we read the hashToMatch value from the contract, that is used for the ecrecover function
  const hashToMatch = await readContract({
    chainId: hardhat.id,
    address: registryAddress,
    abi: PermaPassDIDRegistry[hardhat.id].abi,
    functionName: "hashToMatch",
    args: [identity, newOwner],
  });

  if (ethersHash === hashToMatch) {
    console.log("hash generation - success, ethersHash === hashToMatch");
  } else {
    console.log("FAILED ethersHash !== hashToMatch");
    return "FAILED";
  }

  // const canonicalSignature = await EthrDidExtension.createMetaSignature(context, identifier, ethersHash)

  //   const controllerKey = await context.agent.keyManagerGet({ kid: identifier.controllerKeyId! })
  //   if (typeof controllerKey === 'undefined') {
  //     throw new Error('invalid_argument: identifier.controllerKeyId is not managed by this agent')
  //   }
  //   const signature = await context.agent.keyManagerSign({
  //     keyRef: controllerKey.kid,
  //     data: metaHash,
  //     algorithm: 'eth_rawSign',
  //     encoding: 'hex',
  //   })
  //   return Signature.from(signature)

  // Assuming privateKey is defined somewhere above.
  const privateKeyHex = ethers.utils.hexlify(ethers.utils.arrayify(privateKey));
  console.log(`hash generation - privateKeyHex: ${privateKeyHex}`);

  // Create a Wallet instance instead of directly using SigningKey for more typical usage.
  const wallet = new ethers.Wallet(privateKeyHex);

  // Sign the hash (or message digest).
  const signature = await wallet.signMessage(ethers.utils.arrayify(ethersHash));

  console.log(`hash generation - signature: ${signature}`);

  // To split the signature into r, s, and v values you can use the splitSignature function if necessary:
  const sig = ethers.utils.splitSignature(signature);
  console.log(`hash generation - sig: r: ${sig.r}, s: ${sig.s}, v: ${sig.v}`);

  const ethersSignature = ethers.utils.joinSignature({ r: sig.r, s: sig.s, v: sig.v });
  const ethersSigner = ethers.utils.recoverAddress(ethersHash, ethersSignature);
  console.log(`message signature - resolved ethersSigner ${ethersSigner}`);

  // const messageToSign = ethers.utils.arrayify(ethers.utils.hashMessage(ethers.utils.arrayify(ethersHash)));
  // const ethersFlatSig = await etherSigner.signMessage(messageToSign);
  // const ethersSig = ethers.utils.splitSignature(ethersFlatSig);
  // const ethersSigV = ethersSig.v;
  // const ethersSigR = ethersSig.r;
  // const ethersSigS = ethersSig.s;
  // console.log(`hash generation - ethersSigV: ${ethersSigV}`);
  // console.log(`hash generation - ethersSigR: ${ethersSigR}`);
  // console.log(`hash generation - ethersSigS: ${ethersSigS}`);

  // const ethersSignature = ethers.utils.joinSignature({ r: ethersSigR, s: ethersSigS, v: ethersSigV });
  // const ethersSigner = ethers.utils.recoverAddress(ethersHash, ethersSignature);
  // console.log(`message signature - resolved ethersSigner ${ethersSigner}`);
  // const signerToMatch = await readContract({
  //   chainId: hardhat.id,
  //   address: PermaPassDIDRegistry[hardhat.id].address,
  //   abi: PermaPassDIDRegistry[hardhat.id].abi,
  //   functionName: "signerToMatch",
  //   args: [ethersSigV, ethersSigR as Address, ethersSigS as Address, ethersHash],
  // });
  // console.log(`message signature - signerToMatch   ${signerToMatch}`);
  // console.log(`message signature - actualSigner    ${etherSigner.address}`);

  // if (signerToMatch !== etherSigner.address) {
  //   console.log("FAILED signerToMatch !== etherSigner.address)");
  //   return "FAILED";
  // } else {
  //   console.log("message signature - success, signerToMatch == etherSigner.address");
  // }

  return "SUCCESS";
};

// Connect to Ethereum node
const provider = new ethers.providers.JsonRpcProvider(config.HARDHAT_RPC_URL);

// Your wallet address (change this to your actual wallet address)
const PRIVATE_KEY = config.PRIVATE_KEY;
const myWallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Prepare data for signing
async function createDID() {
  // Create a new random wallet
  const randomWallet = ethers.Wallet.createRandom().connect(provider);

  const contractAddress = PermaPassDIDRegistry[hardhat.id].address;
  const contractABI = PermaPassDIDRegistry[hardhat.id].abi;
  const contract = new ethers.Contract(contractAddress, contractABI, myWallet);

  const nonce = await contract.nonce(randomWallet.address);
  const identity = randomWallet.address;
  const newOwner = myWallet.address;
  const messageHash = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ["bytes1", "bytes1", "address", "uint", "address", "string", "address"],
      ["0x19", "0x00", contract.address, nonce, identity, "changeOwner", newOwner]
    )
  );

  const signingKey = new ethers.utils.SigningKey(randomWallet.privateKey);
  const signature = ethers.utils.joinSignature(signingKey.signDigest(messageHash));
  const sig = ethers.utils.splitSignature(signature);

  const expectedSigner = ethers.utils.recoverAddress(messageHash, signature);
  console.log(`Random wallet signer: ${randomWallet.address}`);
  console.log(`Expected signer:      ${expectedSigner}`);
  if (expectedSigner !== randomWallet.address) {
    throw new Error("Invalid signature");
  }

  const tx = await contract.changeOwnerSigned(randomWallet.address, sig.v, sig.r, sig.s, myWallet.address, {
    from: myWallet.address,
  });

  await tx.wait();

  return "did:ethr:hardhat:" + identity;
}

export const blockchain = {
  readNFTPassport,
  mintNFT,
  setTokenURI,
  createDID,
};
