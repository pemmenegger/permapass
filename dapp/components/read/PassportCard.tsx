import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { PassportCreate } from "../../types";
import { SecondaryButton } from "../ui/buttons";
import { commonColors } from "../../styles";
import { fromCamelCaseToTitleCase } from "../../lib/utils";

interface PassportCardProps {
  passportData: PassportCreate;
  handleUpdate?: () => void;
  handleDelete?: () => void;
  isDeleted?: boolean;
}

export default function PassportCard({ passportData, handleUpdate, handleDelete, isDeleted }: PassportCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.attributesContainer}>
        {Object.entries(passportData).map(([key, value]) => (
          <View key={key}>
            <Text style={styles.attributeKey}>{fromCamelCaseToTitleCase(key)}</Text>
            <Text style={styles.attributeValue}>{value}</Text>
          </View>
        ))}
      </View>
      {handleUpdate && handleDelete && (
        <View style={styles.buttonContainer}>
          <SecondaryButton title="Update" onPress={handleUpdate} />
          <SecondaryButton title="Delete" onPress={handleDelete} />
        </View>
      )}
      {isDeleted && <Text style={styles.deleted}>This passport has been deleted</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: commonColors.secondary,
    backgroundColor: commonColors.white,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  attributesContainer: {
    flexDirection: "column",
    gap: 10,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 10,
    marginTop: 20,
  },
  attributeKey: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
  },
  attributeValue: {
    fontSize: 32,
    color: commonColors.gray,
  },
  deleted: {
    fontSize: 14,
    textAlign: "center",
    color: commonColors.red,
  },
});
