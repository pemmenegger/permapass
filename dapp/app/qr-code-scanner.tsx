import React, { useState } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { router } from "expo-router";
import { CrossIcon } from "../components/icons/CrossIcon";
import { useAsyncEffect } from "../hooks/useAsyncEffect";

export default function Page() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);

  useAsyncEffect(async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === "granted");
  }, []);

  const handleBarCodeScanned = ({ data }: { type: any; data: any }) => {
    setScanned(true);
    if (data.startsWith("com.permapass.app://read?")) {
      const queryParams = new URLSearchParams(data.split("?")[1]);
      router.push({
        pathname: "read",
        params: {
          metadataURI: queryParams.get("metadataURI"),
        },
      });
    } else {
      alert(`The scanned QR Code is not a QR Code passport.`);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <CrossIcon color="white" height={18} strokeWidth={2} />
      </TouchableOpacity>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 5,
    zIndex: 1,
  },
});
