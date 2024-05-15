import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { defaultStyles } from "../styles";

interface OptionCardProps {
  text: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function OptionCard({ text, isSelected, onPress }: OptionCardProps) {
  const containerStyle = [styles.containerBase, isSelected ? styles.containerSelected : styles.containerUnselected];
  const textStyle = [styles.textBase, isSelected ? styles.textSelected : styles.textUnselected];

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      <Text style={textStyle}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerBase: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    width: 200,
    height: 50,
    marginVertical: 5,
    borderRadius: 10,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 5,
    shadowOpacity: 0.2,
  },
  containerUnselected: {
    backgroundColor: defaultStyles.white,
    shadowColor: defaultStyles.black,
  },
  containerSelected: {
    backgroundColor: defaultStyles.black,
    shadowColor: defaultStyles.black,
  },
  textBase: {
    fontSize: defaultStyles.fontMedium,
    fontWeight: "bold",
  },
  textUnselected: {
    color: defaultStyles.black,
  },
  textSelected: {
    color: defaultStyles.white,
  },
});
