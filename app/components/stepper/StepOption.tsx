import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { commonColors, commonStyles } from "../../styles";

interface StepOptionProps {
  title: string;
  subtitle: string;
  isSelected?: boolean;
  onPress: () => void;
  Icon?: React.ReactNode;
}

export default function StepOption({ title, subtitle, isSelected = false, onPress, Icon = null }: StepOptionProps) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: commonColors.white,
          borderWidth: 2,
          borderRadius: 12,
          padding: 20,
          marginVertical: 10,
          shadowColor: commonColors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
          borderColor: isSelected ? commonColors.primary : commonColors.black,
        },
        content: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        textContainer: {
          flex: 1,
          paddingRight: 10,
        },
        iconContainer: {
          marginLeft: 10,
        },
        title: {
          ...commonStyles.h2,
          marginBottom: 10,
        },
        subtitle: {
          ...commonStyles.h4,
          fontSize: 16,
        },
      }),
    [isSelected]
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {/* {Icon && <View style={styles.iconContainer}>{Icon}</View>} */}
      </View>
    </TouchableOpacity>
  );
}
