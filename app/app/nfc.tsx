import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { execHaloCmdRN } from "@arx-research/libhalo/api/react-native.js";
import { haloConvertSignature, haloRecoverPublicKey, SECP256k1_ORDER } from "@arx-research/libhalo/api/common.js";
import ViewWithWalletConnector from "../components/ui/ViewWithWalletConnector";
import { getPublicClient } from "../lib/wagmi";
import { useWalletClient } from "wagmi";
import { encodePacked, keccak256, toBytes, Address } from "viem";
import { ArweaveURI } from "../types";
import { PermaPassPBTRegistry } from "../contracts/PermaPassPBTRegistry";

NfcManager.start();

export default function Page() {
  const { data: walletClient, isError, isLoading } = useWalletClient();

  const KEY_NO = 1;

  const generateDigestToSign = async () => {
    if (!walletClient) {
      console.error("walletClient not available");
      return;
    }

    const chainId = walletClient.chain.id;
    const address = walletClient.account.address;

    const publicClient = getPublicClient(chainId);
    if (!publicClient) {
      throw new Error(`Unsupported chain id: ${chainId}`);
    }

    const currentBlockNumber = await publicClient.getBlockNumber();
    console.log(`Current Block Number: ${currentBlockNumber}`);
    const blockNumberUsedInSig = currentBlockNumber - BigInt(1);
    console.log(`Block Number Used in Signature: ${blockNumberUsedInSig}`);

    const block = await publicClient.getBlock({
      blockNumber: blockNumberUsedInSig,
    });
    const blockhash = block.hash;

    const messagePrefix = "\x19Ethereum Signed Message:\n32";
    const message = keccak256(encodePacked(["address", "bytes32"], [address, blockhash]));
    // const test = toBytes(message);
    const commandDigest = keccak256(encodePacked(["string", "bytes32"], [messagePrefix, message]));

    // const commandDigest = ethers.utils.solidityKeccak256(
    //   ["string", "bytes32"],
    //   [messagePrefix, ethers.utils.arrayify(message)]
    // );
    console.log(`Command Digest: ${commandDigest}`);
    return {
      commandDigest,
      blockNumberUsedInSig,
    };
  };

  const mintPBT = async (
    chipAddress: Address,
    signatureFromChip: Address,
    blockNumberUsedInSig: bigint,
    tokenURI: ArweaveURI
  ) => {
    try {
      if (!walletClient) {
        console.error("walletClient not available");
        return;
      }

      console.log("Minting PBT...");
      const txHash = await walletClient.writeContract({
        address: PermaPassPBTRegistry[31337].address,
        abi: PermaPassPBTRegistry[31337].abi,
        functionName: "mintPBT",
        args: [chipAddress, signatureFromChip, blockNumberUsedInSig, tokenURI],
      });
      console.log(`mintPBT transaction hash: ${txHash}`);

      const publicClient = getPublicClient(31337);
      if (!publicClient) {
        throw new Error(`Unsupported chain id: ${31337}`);
      }

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("setTokenURI transaction confirmed");
      console.log("Token URI updated successfully.");
    } catch (error) {
      console.error("Failed to update token URI:", error);
    }
  };

  async function readNdef() {
    try {
      await NfcManager.requestTechnology(NfcTech.IsoDep);

      // const tag = await NfcManager.getTag();
      // console.log("tag", tag);

      // read ndef
      console.log("Reading NDEF...");
      let ndef = await execHaloCmdRN(NfcManager, { name: "read_ndef" });
      let publicKey = ndef.qs.pk1.toLowerCase();
      console.log("read_ndef", JSON.stringify(ndef, null, 2));
      console.log("publicKey", publicKey);

      // get public keys
      console.log("Getting public keys...");
      let get_key_info = await execHaloCmdRN(NfcManager, {
        name: "get_key_info",
        keyNo: KEY_NO,
      });
      console.log("get_key_info", get_key_info);

      // const commandDigest = "3fa886427cb2f9b29b8b70e8bc9ff5780c605a1625d3d7926d501658dac1a5c3";
      // const { commandDigest, blockNumberUsedInSig } = await generateDigestToSign();

      // get return values from generateDigestToSign
      const result = await generateDigestToSign();
      if (!result) {
        return;
      }
      const { commandDigest, blockNumberUsedInSig } = result;

      // print chars of commandDigest
      console.log("commandDigest", commandDigest);
      console.log(
        "commandDigest chars",
        commandDigest.split("").map((c) => c.charCodeAt(0))
      );

      // You should specify exactly one of the following keys: message, digest or typedData.
      let signature = await execHaloCmdRN(NfcManager, {
        name: "sign",
        digest: commandDigest.startsWith("0x") ? commandDigest.slice(2) : commandDigest,
        // message: "010203",
        keyNo: KEY_NO,
        // legacySignCommand: true,
      });
      let revoveredPublicKeys = haloRecoverPublicKey(signature.input.digest, signature.signature.der, SECP256k1_ORDER);
      let revoveredPublicKey = revoveredPublicKeys[0].toLowerCase();
      console.log("revoveredPublicKey", revoveredPublicKey);

      if (revoveredPublicKey !== publicKey) {
        console.log("ERROR: Public key mismatch");
      } else {
        console.log("SUCCESS: Public key match");
      }

      console.log("signature", JSON.stringify(signature, null, 2));

      let convertedSignature = haloConvertSignature(
        signature.input.digest,
        signature.signature.der,
        publicKey,
        SECP256k1_ORDER
      );

      console.log(`signature ether          ${signature.signature.ether}`);
      console.log(`convertedSignature ether ${convertedSignature.ether}`);
      if (signature.signature.ether !== convertedSignature.ether) {
        console.log("ERROR: Signature mismatch");
      } else {
        console.log("SUCCESS: Signature match");
      }

      // mint PBT
      const chipAddress = signature.etherAddress;
      console.log("chipAddress", chipAddress);
      const signatureFromChip = signature.signature.ether;
      console.log("signatureFromChip", signatureFromChip);

      const tokenURI = "ar://a?i=1";

      await mintPBT(chipAddress, signatureFromChip, blockNumberUsedInSig, tokenURI);
    } catch (ex) {
      Alert.alert("HaLo", "Error: " + String(ex));
      console.warn("Oops!", ex);
    } finally {
      // setButtonText("Click on the button");

      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  }

  return (
    <ViewWithWalletConnector>
      <TouchableOpacity style={{ padding: 100, backgroundColor: "#FF00FF" }} onPress={readNdef}>
        <Text>Tap the tag to the back of your smartphone to mint the PBT</Text>
      </TouchableOpacity>
    </ViewWithWalletConnector>
  );
}
