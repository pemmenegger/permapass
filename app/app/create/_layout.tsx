import { Slot } from "expo-router";
import { SafeAreaView } from "react-native";
import WalletConnector from "../../components/WalletConnector";

export default function Layout() {
  return (
    <SafeAreaView>
      <WalletConnector />
      <Slot />
    </SafeAreaView>
  );
}
