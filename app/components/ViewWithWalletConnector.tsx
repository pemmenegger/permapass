import { SafeAreaView } from "react-native";
import { PropsWithChildren } from "react";
import Container from "./Container";
import WalletConnector from "./WalletConnector";

export default function ViewWithWalletConnector(props: PropsWithChildren) {
  return (
    <Container>
      <SafeAreaView>
        <WalletConnector />
        {props.children}
      </SafeAreaView>
    </Container>
  );
}
