import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import ViewWithWalletConnector from "../components/ui/ViewWithWalletConnector";
import StepOption from "../components/stepper/StepOption";
import { router } from "expo-router";
import { commonColors } from "../styles";
import { PlusSquareIcon } from "../components/icons/PlusSquareIcon";
import StepTitle from "../components/stepper/StepTitle";
import StepSubtitle from "../components/stepper/StepSubtitle";
import { QRCodeIcon } from "../components/icons/QRCodeIcon";
import { NFCIcon } from "../components/icons/NFCIcon";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { execHaloCmdRN } from "@arx-research/libhalo/api/react-native.js";
import InfoButton from "../components/ui/InfoButton";

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
    <ViewWithWalletConnector withScrollView>
      <StepTitle text="Welcome to PermaPass" highlight="PermaPass" />
      <StepSubtitle text="A permanent passport system for construction products using decentralized technologies." />
      <StepOption
        title="Create Passport"
        subtitle="Use QR Codes or HaLo NFC chips as data carriers, and NFTs, PBTs, or DIDs for digital identity."
        onPress={() => router.push("/create/01-set-passport-data")}
        Icon={<PlusSquareIcon height={48} strokeWidth={1.1} color={commonColors.black} />}
      />
      <StepSubtitle text="Scan a QR Code or HaLo NFC to read a passport. Once read, you can update or delete it if you own it. Use the buttons below or scan directly with your device." />
      <StepOption
        title="Read QR Code Passport"
        subtitle="Open the camera to scan a QR code-based passport."
        onPress={() => router.push("/qr-code-scanner")}
        Icon={<QRCodeIcon height={48} strokeWidth={1.1} color={commonColors.black} />}
      />
      <StepOption
        title="Read HaLo NFC Passport"
        subtitle="Open the NFC reader to scan a HaLo NFC-based passport."
        onPress={readNdef}
        Icon={<NFCIcon height={48} strokeWidth={1.1} color={commonColors.black} />}
      />
    </ViewWithWalletConnector>
  );
}
