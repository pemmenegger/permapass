import { View } from "react-native";
import { Link } from "expo-router";
import { NavigationButton } from "../components/NavigationButton";

export default function Page() {
  return (
    <View>
      <NavigationButton to="/create/upload-passport-data">Create</NavigationButton>
      <NavigationButton to="/read">Read</NavigationButton>
    </View>
  );
}
