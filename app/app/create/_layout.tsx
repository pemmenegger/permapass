import { Slot } from "expo-router";
import { SafeAreaView } from "react-native";
import WalletConnector from "../../components/WalletConnector";
import Container from "../../components/Container";

export default function Layout() {
  return (
    <Container>
      <SafeAreaView>
        <WalletConnector />
        <Slot />
      </SafeAreaView>
    </Container>
  );
}
