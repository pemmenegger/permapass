import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { execHaloCmdRN } from "@arx-research/libhalo/api/react-native.js";
import { haloConvertSignature, haloRecoverPublicKey, SECP256k1_ORDER } from "@arx-research/libhalo/api/common.js";

NfcManager.start();

//   // get pk and transform to address, address will be message to sign
//   const publicKey =
//     "04190fbcc938d70d4c64c01a053a8eda4137e20a7772e8d25fc40749e0803b47b5c444f76542486b6018ab350f204e23e4d9c678dc13107e23db607e4988a834d5";
//   const address = ethers.utils.computeAddress("0x" + publicKey.toString("hex"));
//   console.log(`address: ${address}`);

export default function Page() {
  const [buttonText, setButtonText] = useState("Click on the button");
  const KEY_NO = 1;

  async function readNdef() {
    setButtonText("Tap the tag to the back of your smartphone.");

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

      const commandDigest = "3fa886427cb2f9b29b8b70e8bc9ff5780c605a1625d3d7926d501658dac1a5c3";
      // You should specify exactly one of the following keys: message, digest or typedData.
      let signature = await execHaloCmdRN(NfcManager, {
        name: "sign",
        digest: commandDigest,
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
    } catch (ex) {
      Alert.alert("HaLo", "Error: " + String(ex));
      console.warn("Oops!", ex);
    } finally {
      setButtonText("Click on the button");

      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={{ padding: 100, backgroundColor: "#FF00FF" }} onPress={readNdef}>
        <Text>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
