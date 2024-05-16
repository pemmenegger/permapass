import { Slot } from "expo-router";
import ViewWithWalletConnector from "../../components/ViewWithWalletConnector";

export default function Layout() {
  return (
    <ViewWithWalletConnector>
      <Slot />
    </ViewWithWalletConnector>
  );
}
