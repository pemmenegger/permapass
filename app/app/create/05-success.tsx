import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Alert, Share, ShareContent } from "react-native";
import QRCode from "react-native-qrcode-svg";
import StepTitle from "../../components/stepper/StepTitle";
import { PrimaryButton, SecondaryButton } from "../../components/ui/buttons";
import { commonColors } from "../../styles";
import { goToHome } from "../../lib/utils";

interface QRCodeViewProps {
  value: string;
}

export const QRCodeView = ({ value }: QRCodeViewProps) => {
  const qrCodeSize = 200;
  const [svgRef, setSvgRef] = useState<any | null>(null);
  const [content, setContent] = useState<ShareContent | null>(null);

  useEffect(() => {
    if (!svgRef) {
      return;
    }

    svgRef.toDataURL(async (data: any) => {
      if (!data) {
        Alert.alert("Failed to generate QR Code");
      }

      setContent({
        title: "QR Code",
        url: `data:image/png;base64,${data}`,
      });
      console.log("setContent");
    });
  }, [svgRef]);

  const handleShareQrCode = async () => {
    if (!content) {
      Alert.alert("QR Code not available");
      return;
    }

    const options = {
      dialogTitle: "Share QR Code",
    };
    Share.share(content, options);
  };

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: qrCodeSize }}>
        <QRCode value={value} size={qrCodeSize} backgroundColor={commonColors.bg} getRef={(c?) => setSvgRef(c)} />
        <View style={{ height: 20 }} />
        <SecondaryButton title="Share QR Code" onPress={handleShareQrCode} />
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
      {qrCodeURL && <QRCodeView value={qrCodeURL as string} />}
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
