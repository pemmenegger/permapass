import { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import { defaultStyles } from "../styles";

export interface TextScreenProps {
  header: string;
  children: ReactElement | ReactElement[];
}

export const TextScreen = (props: TextScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.header}>{props.header}</Text>
        {props.children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.bgLight,
    padding: 0,
    marginHorizontal: 0,
    marginVertical: 10,
    height: "100%",
  },
  textContainer: {
    paddingHorizontal: 30,
    color: defaultStyles.secondary,
  },
  header: {
    fontSize: defaultStyles.fontLargest,
    marginBottom: 100,
    paddingVertical: 15,
    color: defaultStyles.secondary,
    fontWeight: "bold",
  },
});
