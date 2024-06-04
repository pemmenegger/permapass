import React from "react";
import StepOption from "../components/stepper/StepOption";
import { router } from "expo-router";
import StepTitle from "../components/stepper/StepTitle";
import StepSubtitle from "../components/stepper/StepSubtitle";
import ViewWithHeader from "../components/ViewWithHeader";
import { Alert, View } from "react-native";
import { useHaLoNFCChip } from "../hooks/useHaloNFCChip";
import { usePBTRegistry } from "../hooks/blockchain/usePBTRegistry";

export default function Page() {
  const { haloNFCChip } = useHaLoNFCChip();
  const { pbtRegistry } = usePBTRegistry();

  const readMetadataURI = async () => {
    try {
      const chipAddress = await haloNFCChip.readChipAddress();
      console.log(`Chip address: ${chipAddress}`);
      const metadataURI = await pbtRegistry.readMetadataURI(chipAddress);
      console.log(`Metadata URI: ${metadataURI}`);
      router.push({
        pathname: "read",
        params: {
          metadataURI,
        },
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to read metadata URI");
    }
  };

  return (
    <ViewWithHeader withScrollView>
      <StepTitle text="Welcome to PermaPass" highlight="PermaPass" />
      <StepSubtitle text="A permanent passport system for construction products using decentralized technologies." />
      <StepOption
        title="Create Passport"
        subtitle="Use QR Codes or HaLo NFC chips as data carriers, and NFTs, PBTs, or DIDs for digital product identity."
        onPress={() => router.push("/create/01-set-passport-data")}
      />
      <View style={{ height: 20 }} />
      <StepSubtitle text="To read a passport, scan QR codes with your device or use the buttons below. If you own the passport, you can update or delete it." />
      <StepOption
        title="Read QR Code Passport"
        subtitle="Open the camera to scan a QR code-based passport."
        onPress={() => router.push("/qr-code-scanner")}
      />
      <StepOption
        title="Read HaLo NFC Passport"
        subtitle="Open the NFC reader to scan a HaLo NFC-based passport."
        onPress={readMetadataURI}
      />
    </ViewWithHeader>
  );
}
