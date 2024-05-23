import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import StepTitle from "../../components/stepper/StepTitle";
import DefaultButton from "../../components/ui/DefaultButton";

const QRCodeView = (value: string) => (
  <View>
    <Text>QR Code</Text>
    <QRCode value={value} size={200} />
  </View>
);

export default function Page() {
  const { qrCodeURL } = useLocalSearchParams();

  const gasCosts = 0.0028;
  return (
    <>
      <StepTitle text="Successfully created a passport." highlight="passport" />
      <Text>Your passport has been successfully created.</Text>
      <Text>Gas Costs for creation: {gasCosts} ETH (TODO: compute)</Text>
      {qrCodeURL && QRCodeView(qrCodeURL as string)}
      <DefaultButton text="Home" onPress={() => router.push("/")} type="primary" />
    </>
  );
}
