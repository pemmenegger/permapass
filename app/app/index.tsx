import { SafeAreaView, ScrollView, Text } from "react-native";
import { NavigationButton } from "../components/NavigationButton";
import Container from "../components/Container";
import WalletConnector from "../components/WalletConnector";

export default function Page() {
  return (
    <Container>
      <SafeAreaView>
        <ScrollView>
          <WalletConnector />
          <Text>Welcome to PermaPass</Text>
          <NavigationButton to="/create/01-set-passport-data">Create Passport</NavigationButton>
          <NavigationButton to="/nfc">Read/Write HaLo NFC</NavigationButton>
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
}
