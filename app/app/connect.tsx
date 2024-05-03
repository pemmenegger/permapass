import { W3mButton } from "@web3modal/wagmi-react-native";
import { View, Text } from "react-native";

export default function Page() {
  return (
    <View>
      <Text>Click on the button to connect to your wallet</Text>
      <W3mButton />
    </View>
  );
}
