import { SafeAreaView, View, StyleSheet } from "react-native";
import { PropsWithChildren } from "react";
import WalletConnector from "../WalletConnector";
import { commonColors, commonStyles } from "../../styles";

export default function ViewWithWalletConnector(props: PropsWithChildren) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={{ marginBottom: 30 }}>
          <WalletConnector />
        </View>
        {props.children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: commonColors.bg,
    paddingHorizontal: commonStyles.marginHorizontal,
  },
  safeArea: {
    flex: 1,
  },
});
