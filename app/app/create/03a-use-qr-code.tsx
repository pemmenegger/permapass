import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import QRCode from "react-native-qrcode-svg";

export default function Page() {
  const { passportMetadataURL } = useLocalSearchParams();

  return (
    <View>
      <Text>{passportMetadataURL ? `Passport Metadata URL: ${passportMetadataURL}` : "No passport metadata URL"}</Text>
      {passportMetadataURL && (
        <View>
          <Text>Encoded QR Code URL: {passportMetadataURL}</Text>
          <QRCode value={passportMetadataURL as string} />
        </View>
      )}
    </View>
  );
}
