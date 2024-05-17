import React, { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { commonColors, commonStyles } from "../../styles";

export default function Container(props: PropsWithChildren) {
  return <View style={styles.container}>{props.children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: commonColors.bg,
    paddingHorizontal: commonStyles.marginHorizontal,
  },
});
