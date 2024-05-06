import { View, Text } from "react-native";
import { NavigationButton } from "../components/NavigationButton";

export default function Page() {
  return (
    <View>
      <Text>Welcome to PermaPass</Text>
      <NavigationButton to="/create/01-set-passport-data">Create Passport</NavigationButton>
      <NavigationButton to="/connect">Connect Wallet</NavigationButton>
      <NavigationButton to="/nfc">Read/Write HaLo NFC</NavigationButton>
    </View>
  );
}
