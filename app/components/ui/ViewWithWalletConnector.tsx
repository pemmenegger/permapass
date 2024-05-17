import { SafeAreaView, View } from "react-native";
import { PropsWithChildren } from "react";
import Container from "./Container";
import WalletConnector from "../WalletConnector";

export default function ViewWithWalletConnector(props: PropsWithChildren) {
  return (
    <Container>
      <SafeAreaView>
        <View style={{ marginBottom: 30 }}>
          <WalletConnector />
        </View>
        {props.children}
      </SafeAreaView>
    </Container>
  );
}
