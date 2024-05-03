import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { execHaloCmdRN } from "@arx-research/libhalo/api/react-native.js";

NfcManager.start();

export default function Page() {
  const [buttonText, setButtonText] = useState("Click on the button");

  async function readNdef() {
    setButtonText("Tap the tag to the back of your smartphone.");

    try {
      await NfcManager.requestTechnology(NfcTech.IsoDep);
      const tag = await NfcManager.getTag();

      let res = await execHaloCmdRN(NfcManager, {
        name: "sign",
        message: "0102",
        keyNo: 1,
        /* uncomment the line below if you get an error about setting "command.legacySignCommand = true" */
        // legacySignCommand: true
      });

      Alert.alert("HaLo", JSON.stringify(res, null, 4));
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
