// import { View } from "react-native";
// import { Link } from "expo-router";
// import { NavigationButton } from "../components/NavigationButton";

// export default function Page() {
//   return (
//     <View>
//       <NavigationButton to="/create/upload-passport-data">Create</NavigationButton>
//       <NavigationButton to="/read">Read</NavigationButton>
//     </View>
//   );
// }

import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Button } from "react-native";

// Import the agent from our earlier setup
import { agent } from "../lib/setup";
// import some data types:
import { IIdentifier } from "@veramo/core";
import { DIDResolutionResult } from "@veramo/core";

export default function Page() {
  const [identifiers, setIdentifiers] = useState<IIdentifier[]>([]);
  const [resolutionResult, setResolutionResult] = useState<DIDResolutionResult | undefined>();

  // Add the new identifier to state
  const createIdentifier = async () => {
    const _id = await agent.didManagerCreate({
      provider: "did:ethr:sepolia",
    });
    setIdentifiers((s) => s.concat([_id]));
  };

  // Check for existing identifers on load and set them to state
  useEffect(() => {
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
    console.log("TODO - Resolving DID:", did);
    // const result = await agent.resolveDid({ didUrl: did });
    // console.log(JSON.stringify(result, null, 2));
    // setResolutionResult(result);
  };

  const addService = async (did: string) => {
    const result = await agent.didManagerAddService({
      did,
      service: {
        id: "1",
        type: "DIDCommMessaging",
        serviceEndpoint: "did:web:dev-didcomm-mediator.herokuapp.com",
        description: "for messaging",
      },
    });
    console.log(JSON.stringify(result, null, 2));
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 20 }}>
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
      </ScrollView>
    </SafeAreaView>
  );
}
