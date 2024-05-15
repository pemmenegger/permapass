import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle, DimensionValue } from "react-native";
import { defaultStyles } from "../styles";

interface styleOptions {
  width?: DimensionValue;
  marginLeft?: number;
  marginRight?: number;
}

interface DefaultButtonProps extends PropsWithChildren {
  type: "primary" | "secondary";
  text: string;
  onPress: () => void;
  disabled?: boolean;
  style?: styleOptions;
}

export default function DefaultButton({ type, text, onPress, disabled, style }: DefaultButtonProps) {
  let styleOptions = undefined;
  if (type === "primary") {
    styleOptions = {
      backgroundColor: defaultStyles.black,
      borderColor: defaultStyles.black,
      textColor: defaultStyles.white,
      width: style?.width,
      opacity: disabled ? 0.7 : 1,
    };
  } else if (type === "secondary") {
    styleOptions = {
      backgroundColor: defaultStyles.white,
      borderColor: defaultStyles.black,
      textColor: defaultStyles.black,
      width: style?.width,
      opacity: disabled ? 0.7 : 1,
    };
  }

  const buttonStyles: ViewStyle[] = [internalStyles.button];
  const textStyles: TextStyle[] = [internalStyles.text];

  if (styleOptions) {
    if (styleOptions.backgroundColor) {
      buttonStyles.push({ backgroundColor: styleOptions.backgroundColor });
    }
    if (styleOptions.borderColor) {
      buttonStyles.push({ borderColor: styleOptions.borderColor, borderWidth: 1 });
    }
    if (styleOptions.textColor) {
      textStyles.push({ color: styleOptions.textColor });
    }
    if (styleOptions.width !== undefined) {
      buttonStyles.push({ width: styleOptions.width });
    }
    if (styleOptions.opacity !== undefined) {
      buttonStyles.push({ opacity: styleOptions.opacity });
    }
  }

  return (
    <Pressable style={buttonStyles} onPress={onPress} disabled={disabled}>
      <Text style={textStyles}>{text}</Text>
    </Pressable>
  );
}

const internalStyles = StyleSheet.create({
  button: {
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: defaultStyles.fontMedium,
    textAlign: "center",
  },
});
