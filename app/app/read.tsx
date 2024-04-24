import React, { useState } from "react";
import { Button, Text, View } from "react-native";
import { W3mButton } from "@web3modal/wagmi-react-native";
import * as Linking from "expo-linking";
import { usePassportData } from "../lib/hooks/usePassportData";

export default function Page() {
  const url = Linking.useURL();
  const queryParams = url ? Linking.parse(url).queryParams : {};

  console.log("queryParams", queryParams);

  const passportMetadataURL =
    typeof queryParams?.passportMetadataURL === "string" ? queryParams.passportMetadataURL : "";

  console.log("passportMetadataURL", passportMetadataURL);

  const { data, isLoading, error } = usePassportData(passportMetadataURL);

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <W3mButton />
      <Text>Passport Data: {JSON.stringify(data)}</Text>
    </View>
  );
}
