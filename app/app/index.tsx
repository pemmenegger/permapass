import { View } from "react-native";
import { NavigationButton } from "../components/NavigationButton";

export default function Page() {
  return (
    <View>
      <NavigationButton to="/create/upload-passport-data">Create</NavigationButton>
      <NavigationButton to="/veramo">Veramo</NavigationButton>
    </View>
  );
}
