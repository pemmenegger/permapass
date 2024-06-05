import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle, DimensionValue } from "react-native";
import { commonColors } from "../../styles";

interface StyleOptions {
  width?: DimensionValue;
  marginLeft?: number;
  marginRight?: number;
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleOptions;
}

interface ButtonBaseProps extends ButtonProps {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

const ButtonBase = ({ title, onPress, disabled, style, backgroundColor, borderColor, textColor }: ButtonBaseProps) => {
  const buttonStyles: ViewStyle[] = [
    internalStyles.button,
    {
      backgroundColor,
      borderColor,
      opacity: disabled ? 0.7 : 1,
      ...style,
    },
  ];

  const titleStyles: TextStyle[] = [internalStyles.text, { color: textColor }];

  return (
    <Pressable style={buttonStyles} onPress={onPress} disabled={disabled}>
      <Text style={titleStyles}>{title}</Text>
    </Pressable>
  );
};

const PrimaryButton = (props: ButtonProps) => (
  <ButtonBase
    {...props}
    backgroundColor={commonColors.black}
    borderColor={commonColors.black}
    textColor={commonColors.white}
  />
);

const SecondaryButton = (props: ButtonProps) => (
  <ButtonBase
    {...props}
    backgroundColor={commonColors.white}
    borderColor={commonColors.black}
    textColor={commonColors.black}
  />
);

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

export { PrimaryButton, SecondaryButton };
