import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Text, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import StepTitle from "../../components/stepper/StepTitle";
import { PrimaryButton } from "../../components/ui/buttons";

const QRCodeView = (value: string) => (
  <View>
    <QRCode value={value} size={200} />
  </View>
);

export default function Page() {
  const { qrCodeURL } = useLocalSearchParams();
  const gasCosts = 0.0028;

  return (
    <View style={styles.container}>
      <View>
        <StepTitle text="Successfully created a passport." highlight="passport" />
        <Text>Your passport has been successfully created.</Text>
        <Text>Gas Costs for creation: {gasCosts} ETH (TODO: compute)</Text>
      </View>
      {qrCodeURL && QRCodeView(qrCodeURL as string)}
      <PrimaryButton title="Home" onPress={() => router.push("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
