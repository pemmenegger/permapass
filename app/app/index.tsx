import { View } from "react-native";
import { NavigationButton } from "../components/NavigationButton";

export default function Page() {
  return (
    <View>
      <NavigationButton to="/create/01-upload-passport">Create</NavigationButton>
      <NavigationButton to="/veramo">Veramo</NavigationButton>
    </View>
  );
}
