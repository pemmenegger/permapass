import React from "react";
import { SafeAreaView, View, StyleSheet, ScrollView } from "react-native";
import WalletConnector from "../WalletConnector";
import { commonColors, commonStyles } from "../../styles";

export interface ViewWithWalletConnectorProps extends React.PropsWithChildren {
  withScrollView?: boolean;
}

export default function ViewWithWalletConnector(props: ViewWithWalletConnectorProps) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {props.withScrollView ? (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.walletConnector}>
              <WalletConnector />
            </View>
            <View style={styles.children}>{props.children}</View>
          </ScrollView>
        ) : (
          <View style={styles.content}>
            <View style={styles.walletConnector}>
              <WalletConnector />
            </View>
            <View style={styles.children}>{props.children}</View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: commonColors.bg,
  },
  safeArea: {
    flex: 1,
  },
  walletConnector: {
    marginTop: 12,
    marginBottom: 30,
  },
  children: {
    flex: 1,
    paddingHorizontal: commonStyles.innerMarginHorizontal,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: commonStyles.outerMarginHorizontal,
  },
  content: {
    flex: 1,
    paddingHorizontal: commonStyles.outerMarginHorizontal,
  },
});
