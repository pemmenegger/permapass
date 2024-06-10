import React from "react";
import StepOption from "../components/creation/StepOption";
import { router } from "expo-router";
import Title from "../components/ui/Title";
import Subtitle from "../components/ui/Subtitle";
import ViewWithHeader from "../components/ViewWithHeader";
import { Alert, Button, View } from "react-native";
import { useHaLoNFCChip } from "../hooks/useHaloNFCChip";
import { useHaLoNFCMetadataRegistry } from "../hooks/blockchain/useHaLoNFCMetadataRegistry";
import { useCreation } from "../context/CreationContext";

export default function Page() {
  const { dispatch } = useCreation();
  const { haloNFCChip } = useHaLoNFCChip();
  const { haLoNFCMetadataRegistry } = useHaLoNFCMetadataRegistry();

  const readNFCMetadataURI = async () => {
    try {
      const chipAddress = await haloNFCChip.readChipAddress();
      const metadataURI = await haLoNFCMetadataRegistry.readMetadataURI(chipAddress);
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
    <ViewWithHeader withScrollView disableBackButton>
      <Title text="Welcome to PermaPass" highlight="PermaPass" />
      <Subtitle text="A permanent passport system for construction products using decentralized technologies." />
      <StepOption
        title="Create Passport"
        subtitle="Use QR Codes or HaLo NFC chips as data carriers, and NFTs, PBTs, or DIDs for digital product identity."
        onPress={() => {
          dispatch({ type: "RESET" });
          router.push("/create/01-set-passport-data");
        }}
      />
      <View style={{ height: 20 }} />
      <Subtitle text="To read a passport, scan QR codes with your device or use the buttons below. If you own the passport, you can update or delete it." />
      <StepOption
        title="Read QR Code Passport"
        subtitle="Open the camera to scan a QR code-based passport."
        onPress={() => router.push("/qr-code-scanner")}
      />
      <StepOption
        title="Read HaLo NFC Passport"
        subtitle="Open the NFC reader to scan a HaLo NFC-based passport."
        onPress={readNFCMetadataURI}
      />
    </ViewWithHeader>
  );
}
