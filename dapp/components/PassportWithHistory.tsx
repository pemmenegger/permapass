import React, { useState } from "react";
import { Text } from "react-native";
import { usePassportHistory } from "../hooks/usePassportHistory";
import { PassportMetadata } from "../types";
import LoadingText from "./LoadingText";
import PassportCard from "./PassportCard";
import PassportHistory from "./PassportHistory";

export default function PassportWithHistory({ passportMetadata }: { passportMetadata: PassportMetadata }) {
  const [version, setVersion] = useState(0);
  const { passportHistory, isLoading, error } = usePassportHistory({ passportMetadata, version });

  const currentPassport = passportHistory && passportHistory.length ? passportHistory[0].data : null;

  if (isLoading) {
    return <LoadingText isLoading={true} text="Loading Passport" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!currentPassport) {
    return <Text>No passport available</Text>;
  }

  return (
    <>
      <PassportCard passport={currentPassport} passportMetadata={passportMetadata} setVersion={setVersion} />
      <PassportHistory passportHistory={passportHistory} />
    </>
  );
}
