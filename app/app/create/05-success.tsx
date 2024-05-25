import { useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { Text, StyleSheet, View, Alert, Share } from "react-native";
import QRCode from "react-native-qrcode-svg";
import StepTitle from "../../components/stepper/StepTitle";
import { PrimaryButton, SecondaryButton } from "../../components/ui/buttons";
import { goToHome } from "../../lib/utils";

interface QRCodeViewProps {
  url: string;
}

export const QRCodeView = ({ url }: QRCodeViewProps) => {
  const qrCodeSize = 200;
  const qrCodeRef = useRef();

  const handleShare = async () => {
    if (!qrCodeRef.current) {
      return;
    }

    const svgRef = qrCodeRef.current as any;
    svgRef.toDataURL(async (dataURL: any) => {
      if (!dataURL) {
        Alert.alert("Failed to generate QR Code");
      }

      const content = {
        title: "QR Code",
        url: `data:image/png;base64,${dataURL}`,
      };

      const options = {
        dialogTitle: "Share QR Code",
      };

      Share.share(content, options);
    });
  };

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: qrCodeSize }}>
        <QRCode value={url} size={qrCodeSize} backgroundColor={"transparent"} getRef={(c) => (qrCodeRef.current = c)} />
        <View style={{ height: 20 }} />
        <SecondaryButton title="Share QR Code" onPress={handleShare} />
      </View>
    </View>
  );
};

export default function Page() {
  const { qrCodeURL } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <View>
        <StepTitle text="Successfully created a passport." highlight="passport" />
        {qrCodeURL ? (
          <Text style={styles.qrCodeText}>
            Attach the following QR Code to your construction product to make the passport accessible:
          </Text>
        ) : (
          <Text>Attach the HaLo NFC chip to your construction product to make the passport accessible.</Text>
        )}
      </View>
      {qrCodeURL && <QRCodeView url={qrCodeURL as string} />}
      <PrimaryButton title="Home" onPress={goToHome} />
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
