import { Slot } from "expo-router";
import ViewWithHeader from "../../components/ViewWithHeader";

export default function Layout() {
  return (
    <ViewWithHeader>
      <Slot />
    </ViewWithHeader>
  );
}
