import { Slot } from "expo-router";
import ViewWithWalletConnector from "../../components/ui/ViewWithWalletConnector";

export default function Layout() {
  return (
    <ViewWithWalletConnector>
      <Slot />
    </ViewWithWalletConnector>
  );
}
