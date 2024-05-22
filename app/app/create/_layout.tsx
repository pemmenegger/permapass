import { Slot, Stack } from "expo-router";
import ViewWithWalletConnector from "../../components/ui/ViewWithWalletConnector";

export default function Layout() {
  return (
    <ViewWithWalletConnector>
      {/* <Stack screenOptions={{ animation: "slide_from_right", headerShown: false }} /> */}
      <Slot />
    </ViewWithWalletConnector>
  );
}
