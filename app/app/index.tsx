import { View } from "react-native";
import { NavigationButton } from "../components/NavigationButton";

export default function Page() {
  return (
    <View>
      <NavigationButton to="/create/upload-passport-data">Create</NavigationButton>
      <NavigationButton
        to="/read"
        params={{
          passportMetadataURL: "https://arweave.net/GwEBe9BCaFIu7GtidxegrPJwDOTkvVFGo-sua79v5dI",
        }}
      >
        Read
      </NavigationButton>
    </View>
  );
}
