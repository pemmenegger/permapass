import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { PassportCreate, PassportRead } from "../../types";
import { commonColors } from "../../styles";
import { ArrowRightIcon } from "../icons/ArrowRightIcon";
import { fromCamelCaseToTitleCase, fromBlockTimestampToDateTime } from "../../lib/utils";

interface PassportTimelineProps {
  historyEntries: PassportRead[];
}

export default function PassportTimeline({ historyEntries }: PassportTimelineProps) {
  const renderPassportChange = ({
    prevPassport,
    currPassport,
  }: {
    prevPassport: PassportRead;
    currPassport: PassportRead;
  }) => {
    return (
      <>
        {Object.keys(prevPassport.data).map((key) => {
          const oldValue = prevPassport.data[key as keyof PassportCreate];
          const newValue = currPassport.data[key as keyof PassportCreate];
          return (
            <View key={key}>
              {oldValue !== newValue && (
                <Text style={styles.changeText}>
                  {fromCamelCaseToTitleCase(key)}: <Text style={styles.strikeThrough}>{oldValue}</Text>{" "}
                  <ArrowRightIcon strokeWidth={2} color={commonColors.black} height={10} /> <Text>{newValue}</Text>
                </Text>
              )}
            </View>
          );
        })}
        <Text style={styles.timelineDate}>
          Update | {fromBlockTimestampToDateTime(currPassport.details.blockTimestamp)}
        </Text>
      </>
    );
  };

  const renderPassportCreation = (passport: PassportRead) => (
    <>
      {Object.keys(passport.data).map((key) => (
        <Text style={styles.changeText} key={key}>
          {fromCamelCaseToTitleCase(key)}: <Text>{passport.data[key as keyof PassportCreate]}</Text>
        </Text>
      ))}
      <Text style={styles.timelineDate}>
        Creation | {fromBlockTimestampToDateTime(passport.details.blockTimestamp)}
      </Text>
    </>
  );

  if (historyEntries.length === 1) {
    return <Text style={styles.onlyCreationVersion}>This passport has only one version</Text>;
  }

  return (
    <View style={styles.timelineContainer}>
      {historyEntries.map((details, index) => {
        const isCreationVersion = index === historyEntries.length - 1;
        return (
          <View key={index} style={styles.timelineEntry}>
            {!isCreationVersion && <View style={styles.timelineLine} />}
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              {isCreationVersion
                ? renderPassportCreation(details)
                : renderPassportChange({
                    prevPassport: historyEntries[index + 1],
                    currPassport: details,
                  })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timelineContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: 20,
    position: "relative",
  },
  timelineEntry: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  timelineDot: {
    marginTop: 24,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: commonColors.vercelBlack,
    position: "absolute",
    left: -7,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    backgroundColor: commonColors.vercelBlack,
    position: "absolute",
    left: -3,
    top: 0,
    bottom: -24,
  },
  timelineContent: {
    marginTop: 20,
    marginLeft: 20,
  },
  timelineDate: {
    fontSize: 12,
    color: commonColors.gray,
  },
  changeText: {
    fontSize: 14,
    color: commonColors.black,
  },
  strikeThrough: {
    textDecorationLine: "line-through",
    color: commonColors.vercelBlack,
  },
  onlyCreationVersion: {
    fontSize: 14,
    color: commonColors.gray,
    marginVertical: 20,
    textAlign: "center",
  },
});
