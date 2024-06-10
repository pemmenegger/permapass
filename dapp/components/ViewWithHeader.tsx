import React from "react";
import { SafeAreaView, View, StyleSheet, ScrollView } from "react-native";
import { commonColors, commonStyles } from "../styles";
import Header from "./Header";

export interface ViewWithHeaderProps extends React.PropsWithChildren {
  withScrollView?: boolean;
  onBack?: () => void;
}

export default function ViewWithHeader({ withScrollView, children, onBack }: ViewWithHeaderProps) {
  return (
    <SafeAreaView style={styles.mainSafeArea}>
      <SafeAreaView style={styles.innerSafeArea}>
        <View style={styles.headerWrapper}>
          <Header onBack={onBack} />
        </View>
      </SafeAreaView>
      {withScrollView ? (
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
          <View style={styles.childrenContainer}>{children}</View>
        </ScrollView>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.childrenContainer}>{children}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainSafeArea: {
    flex: 1,
    backgroundColor: commonColors.bg,
  },
  innerSafeArea: {
    zIndex: 10,
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    width: "100%",
    paddingHorizontal: commonStyles.outerMarginHorizontal,
    backgroundColor: commonColors.bg,
  },
  childrenContainer: {
    flex: 1,
    paddingHorizontal: commonStyles.innerMarginHorizontal,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingTop: 90,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 90,
  },
});
