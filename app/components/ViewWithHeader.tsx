import React from "react";
import { SafeAreaView, View, StyleSheet, ScrollView } from "react-native";
import { commonColors, commonStyles } from "../styles";
import Header from "./Header";

export interface ViewWithHeaderProps extends React.PropsWithChildren {
  useScrollView?: boolean;
}

export default function ViewWithHeader({ useScrollView, children }: ViewWithHeaderProps) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {useScrollView ? (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Header />
            <View style={styles.children}>{children}</View>
          </ScrollView>
        ) : (
          <View style={styles.content}>
            <Header />
            <View style={styles.children}>{children}</View>
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
