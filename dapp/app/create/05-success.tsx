import React, { useRef, useState } from "react";
import { Text, StyleSheet, View, Alert, Share } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Title from "../../components/ui/Title";
import { PrimaryButton, SecondaryButton } from "../../components/ui/buttons";
import { encodeDataCarrierURL, goToHome } from "../../lib/utils";
import { useCreation } from "../../context/CreationContext";

interface QRCodeViewProps {
  url: string;
}

export const QRCodeView = ({ url }: QRCodeViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const qrCodeSize = 200;
  const qrCodeRef = useRef();

  const handleShare = async () => {
    if (!qrCodeRef.current) {
      return;
    }

    try {
      setIsLoading(true);
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
    } catch (error) {
      Alert.alert("Failed to share QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: qrCodeSize }}>
        <QRCode value={url} size={qrCodeSize} backgroundColor={"transparent"} getRef={(c) => (qrCodeRef.current = c)} />
        <View style={{ height: 20 }} />
        <SecondaryButton title={isLoading ? "Loading..." : "Share QR Code"} onPress={handleShare} />
      </View>
    </View>
  );
};

export default function Page() {
  const { state } = useCreation();

  const isQRCode = state.userInput.dataCarrier === "qr";

  const passportMetadataURI = state.results.passportMetadataURI;
  if (!passportMetadataURI) {
    Alert.alert("Passport metadata URI not available");
    return null;
  }

  return (
    <View style={styles.container}>
      <View>
        <Title text="Successfully created a passport." highlight="passport" />
        {isQRCode ? (
          <Text style={styles.qrCodeText}>
            Attach the following QR Code to your construction product to make the passport accessible:
          </Text>
        ) : (
          <Text>Attach the HaLo NFC chip to your construction product to make the passport accessible.</Text>
        )}
      </View>
      {isQRCode && <QRCodeView url={encodeDataCarrierURL(passportMetadataURI)} />}
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
