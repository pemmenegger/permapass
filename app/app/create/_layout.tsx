import { Slot, Stack } from "expo-router";
import ViewWithHeader from "../../components/ViewWithHeader";

export default function Layout() {
  return (
    <ViewWithHeader>
      {/* <Stack screenOptions={{ animation: "fade", headerShown: false }} /> */}
      <Slot />
    </ViewWithHeader>
  );
}
