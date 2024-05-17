import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { commonColors, commonStyles } from "../../styles";

interface StepOptionProps {
  title: string;
  subtitle: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function StepOption({ title, subtitle, isSelected, onPress }: StepOptionProps) {
  return (
    <TouchableOpacity style={[styles.card, isSelected ? styles.selectedCard : styles.defaultCard]} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: commonColors.white,
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    marginVertical: 10,
    shadowColor: commonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  defaultCard: {
    borderColor: commonColors.black,
  },
  selectedCard: {
    borderColor: commonColors.primary,
  },
  title: {
    ...commonStyles.title,
    marginBottom: 10,
  },
  subtitle: {
    ...commonStyles.subtitle,
    fontSize: 16,
  },
});
