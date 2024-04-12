import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Page() {
  const { tokenURI } = useLocalSearchParams();
  return (
    <View>
      <Text>Read Screen</Text>
      <Text>TokenURI: {tokenURI}</Text>
    </View>
  );
}
