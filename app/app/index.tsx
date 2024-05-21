import { ScrollView, Text } from "react-native";
import { NavigationButton } from "../components/NavigationButton";
import ViewWithWalletConnector from "../components/ui/ViewWithWalletConnector";

export default function Page() {
  return (
    <ViewWithWalletConnector>
      <ScrollView>
        <Text>Welcome to PermaPass</Text>
        <NavigationButton to="/create/01-set-passport-data">Create Passport</NavigationButton>
        <NavigationButton to="/nfc">Read/Write HaLo NFC</NavigationButton>
      </ScrollView>
    </ViewWithWalletConnector>
  );
}
