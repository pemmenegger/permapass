import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, StyleSheet, View, Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import StepTitle from "../../components/stepper/StepTitle";
import { PrimaryButton, SecondaryButton } from "../../components/ui/buttons";
import { commonColors } from "../../styles";

const QRCodeView = (value: string) => (
  <View style={{ alignItems: "center" }}>
    <View style={{ width: 200 }}>
      <QRCode value={value} size={200} backgroundColor={commonColors.bg} />
      <View style={{ height: 20 }} />
      <SecondaryButton title="Share QR Code" onPress={() => Alert.alert("To be implemented")} />
    </View>
  </View>
);

export default function Page() {
  const { qrCodeURL } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <View>
        <StepTitle text="Successfully created a passport." highlight="passport" />
        <Text>Your passport has been successfully created.</Text>
        {qrCodeURL ? (
          <Text style={styles.qrCodeText}>
            Attach the following QR Code to your construction product to make the passport accessible:
          </Text>
        ) : (
          <Text>Attach the HaLo NFC chip to your construction product to make the passport accessible.</Text>
        )}
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
  qrCodeText: {
    paddingBottom: 10,
  },
});
