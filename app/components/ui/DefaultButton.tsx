import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle, DimensionValue } from "react-native";
import { commonColors, commonStyles } from "../../styles";

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
      backgroundColor: commonColors.black,
      borderColor: commonColors.black,
      textColor: commonColors.white,
      width: style?.width,
      opacity: disabled ? 0.7 : 1,
    };
  } else if (type === "secondary") {
    styleOptions = {
      backgroundColor: commonColors.white,
      borderColor: commonColors.black,
      textColor: commonColors.black,
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter-Medium",
    letterSpacing: -0.2,
  },
});
