import { SafeAreaView, ScrollView, Text } from "react-native";
import { NavigationButton } from "../components/NavigationButton";
import Container from "../components/Container";

export default function Page() {
  return (
    <Container>
      <SafeAreaView>
        <ScrollView>
          <Text>Welcome to PermaPass</Text>
          <NavigationButton to="/create/01-set-passport-data">Create Passport</NavigationButton>
          <NavigationButton to="/nfc">Read/Write HaLo NFC</NavigationButton>
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
}
