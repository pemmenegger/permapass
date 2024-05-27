import React from "react";
import StepOption from "../components/stepper/StepOption";
import { router } from "expo-router";
import StepTitle from "../components/stepper/StepTitle";
import StepSubtitle from "../components/stepper/StepSubtitle";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { execHaloCmdRN } from "@arx-research/libhalo/api/react-native.js";
import ViewWithHeader from "../components/ViewWithHeader";
import { View } from "react-native";

NfcManager.start();

export default function Page() {
  const readNdef = async () => {
    await NfcManager.requestTechnology(NfcTech.IsoDep);

    console.log("Reading NDEF...");
    let ndef = await execHaloCmdRN(NfcManager, { name: "read_ndef" });
    console.log("read_ndef", JSON.stringify(ndef, null, 2));

    // TODO: read uri and open reading view
  };

  return (
    <ViewWithHeader withScrollView>
      <StepTitle text="Welcome to PermaPass" highlight="PermaPass" />
      <StepSubtitle text="A permanent passport system for construction products using decentralized technologies." />
      <StepOption
        title="Create Passport"
        subtitle="Use QR Codes or HaLo NFC chips as data carriers, and NFTs, PBTs, or DIDs for digital identity."
        onPress={() => router.push("/create/01-set-passport-data")}
      />
      <View style={{ height: 20 }} />
      <StepSubtitle text="Scan a QR Code or HaLo NFC to read a passport. Once read, you can update or delete it if you own it. Use the buttons below or scan directly with your device." />
      <StepOption
        title="Read QR Code Passport"
        subtitle="Open the camera to scan a QR code-based passport."
        onPress={() => router.push("/qr-code-scanner")}
      />
      <StepOption
        title="Read HaLo NFC Passport"
        subtitle="Open the NFC reader to scan a HaLo NFC-based passport."
        onPress={readNdef}
      />
    </ViewWithHeader>
  );
}
