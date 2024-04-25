import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Button } from "react-native";
import { IIdentifier } from "@veramo/core";
import { DIDResolutionResult } from "@veramo/core";
import { useVeramoAgent } from "../lib/hooks/useVeramoAgent";

export default function Page() {
  const { agent } = useVeramoAgent();
  const [identifiers, setIdentifiers] = useState<IIdentifier[]>([]);
  const [resolutionResult, setResolutionResult] = useState<DIDResolutionResult | undefined>();

  // Add the new identifier to state
  const createIdentifier = async (provider: string) => {
    console.log("Creating identifier...");
    if (!agent) console.error("Agent not initialized");
    const _id = await agent!.didManagerCreate({
      provider,
    });
    console.log("Created identifier:", _id);
    setIdentifiers((s) => s.concat([_id]));
  };

  // Check for existing identifers on load and set them to state
  useEffect(() => {
    const getIdentifiers = async () => {
      const _ids = await agent!.didManagerFind();
      setIdentifiers(_ids);

      // Inspect the id object in your debug tool
      console.log("_ids:", _ids);
    };

    getIdentifiers();
  }, []);

  // Resolve a DID
  const resolveDID = async (did: string) => {
    console.log(`Resolving ${did}...`);
    const result = await agent!.resolveDid({ didUrl: did });
    console.log(JSON.stringify(result, null, 2));
    console.log("BlockchainAccountId: ", result.didDocument?.verificationMethod?.[0].blockchainAccountId);
    setResolutionResult(result);
  };

  const addService = async (did: string) => {
    console.log(`Adding service to ${did}...`);
    const result = await agent!.didManagerAddService({
      did,
      service: {
        id: "1",
        type: "MetadataService",
        serviceEndpoint: "https://arweave.net/123",
      },
    });
    console.log(JSON.stringify(result, null, 2));
  };

  if (!agent) {
    return <Text>Loading agent...</Text>;
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>Identifiers</Text>
          <Button onPress={() => createIdentifier("did:ethr:sepolia")} title={"Create Sepolia Identifier"} />
          <Button onPress={() => createIdentifier("did:ethr:hardhat")} title={"Create Hardhat Identifier"} />
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
