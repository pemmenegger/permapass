import { View, Text } from "react-native";
import { NavigationButton } from "../components/NavigationButton";

export default function Page() {
  return (
    <View>
      <Text>Welcome to PermaPass</Text>
      <NavigationButton to="/connect">Connct Wallet</NavigationButton>
    </View>
  );
}
