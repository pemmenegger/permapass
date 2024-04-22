// import { View } from "react-native";
// import { Link, Stack } from "expo-router";
// import { NavigationButton } from "../components/NavigationButton";
// import { W3mButton } from "@web3modal/wagmi-react-native";

// export default function Page() {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Stack.Screen
//         options={{
//           // https://reactnavigation.org/docs/headers#setting-the-header-title
//           title: "My home",
//           // https://reactnavigation.org/docs/headers#adjusting-header-styles
//           headerStyle: { backgroundColor: "#f4511e" },
//           headerTintColor: "#fff",
//           headerTitleStyle: {
//             fontWeight: "bold",
//           },
//           // https://reactnavigation.org/docs/headers#replacing-the-title-with-a-custom-component
//           headerTitle: (props) => <W3mButton />,
//         }}
//       />
//       <View>
//         <NavigationButton to="/create/upload-passport-data">Create</NavigationButton>
//         <NavigationButton to="/read">Read</NavigationButton>
//       </View>
//     </View>
//   );
// }

import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Button } from "react-native";
import { W3mButton } from "@web3modal/wagmi-react-native";

// import some data types:
import { IIdentifier } from "@veramo/core";
import { DIDResolutionResult } from "@veramo/core";
import { useAgent } from "../lib/hooks/useAgent";

export default function Page() {
  const [identifiers, setIdentifiers] = useState<IIdentifier[]>([]);
  const [resolutionResult, setResolutionResult] = useState<DIDResolutionResult | undefined>();
  const agent = useAgent();

  // Add the new identifier to state
  const createIdentifier = async () => {
    if (!agent) {
      console.log("Agent not initialized");
      return;
    }
    console.log("Creating identifier...");
    const _id = await agent.didManagerCreate();
    console.log("Created identifier:", _id);
    setIdentifiers((s) => s.concat([_id]));
  };

  // Check for existing identifers on load and set them to state
  useEffect(() => {
    if (!agent) {
      console.log("Agent not initialized");
      return;
    }
    const getIdentifiers = async () => {
      const _ids = await agent.didManagerFind();
      setIdentifiers(_ids);

      // Inspect the id object in your debug tool
      console.log("_ids:", _ids);
    };

    getIdentifiers();
  }, []);

  // Resolve a DID
  const resolveDID = async (did: string) => {
    if (!agent) {
      console.log("Agent not initialized");
      return;
    }
    console.log(`Resolving ${did}...`);
    const result = await agent.resolveDid({ didUrl: did });
    console.log(JSON.stringify(result, null, 2));
    console.log("BlockchainAccountId: ", result.didDocument?.verificationMethod?.[0].blockchainAccountId);
    setResolutionResult(result);
  };

  const addService = async (did: string) => {
    if (!agent) {
      console.log("Agent not initialized");
      return;
    }
    console.log(`Adding service to ${did}...`);
    const result = await agent.didManagerAddService({
      did,
      service: {
        id: "1",
        type: "MetadataService",
        serviceEndpoint: "https://arweave.net/123",
      },
    });
    console.log(JSON.stringify(result, null, 2));
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 20 }}>
          <W3mButton />
          {agent ? (
            <View>
              <Text style={{ fontSize: 30, fontWeight: "bold" }}>Identifiers</Text>
              <Button onPress={() => createIdentifier()} title={"Create Identifier"} />
              <View style={{ marginBottom: 50, marginTop: 20 }}>
                {identifiers && identifiers.length > 0 ? (
                  identifiers.map((id: IIdentifier) => (
                    <View key={id.did}>
                      <Button onPress={() => resolveDID(id.did)} title={id.did} />
                      <Button onPress={() => addService(id.did)} title={"Add Service"} />
                    </View>
                  ))
                ) : (
                  <Text>No identifiers created yet</Text>
                )}
              </View>
              <Text style={{ fontSize: 30, fontWeight: "bold" }}>Resolved DID document:</Text>
              <View style={{ marginBottom: 50, marginTop: 20 }}>
                {resolutionResult ? (
                  <Text>{JSON.stringify(resolutionResult.didDocument, null, 2)}</Text>
                ) : (
                  <Text>tap on a DID to resolve it</Text>
                )}
              </View>
            </View>
          ) : (
            <Text>Agent not initialized</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
