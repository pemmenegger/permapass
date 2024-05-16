import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { PropsWithChildren, ReactNode } from "react";
import { defaultStyles } from "../styles";

export interface NavigationButtonProps extends PropsWithChildren {
  to: string;
  params?: Record<string, string>;
  // icon?: ReactNode;
}

export const NavigationButton = (props: NavigationButtonProps) => {
  return (
    <Link
      href={{
        pathname: props.to,
        params: props.params,
      }}
      asChild
    >
      <Pressable style={styles.donateButton}>
        <Text style={styles.donateButtonText}>{props.children}</Text>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  donateButton: {
    backgroundColor: "#7393B3",
    borderRadius: 15,
    elevation: 3,
    marginTop: 15,
  },
  donateButtonText: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: defaultStyles.fontMedium,
    fontWeight: "bold",
    color: defaultStyles.white,
    textAlign: "center",
  },
});
