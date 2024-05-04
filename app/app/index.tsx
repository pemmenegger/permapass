import { SafeAreaView, View, Text } from "react-native";
import { NavigationButton } from "../components/NavigationButton";

export default function Page() {
  return (
    <SafeAreaView className="flex-1">
      <View className="p-6">
        <Text className="text-2xl font-bold mb-4">Welcome to PermaPass</Text>
        <NavigationButton to="/create/01-set-passport-data">Create Passport</NavigationButton>
        <NavigationButton to="/connect">Connect Wallet</NavigationButton>
        <NavigationButton to="/nfc">Read/Write HaLo NFC</NavigationButton>
      </View>
    </SafeAreaView>
  );
}
