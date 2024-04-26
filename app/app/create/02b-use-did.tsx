import { Button, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { IIdentifier } from "@veramo/core";
import { NavigationButton } from "../../components/NavigationButton";
import { useVeramoAgent } from "../../lib/hooks/useVeramoAgent";
import { uploadDIDPassportMetadata } from "../../lib/arweave";
import { hardhat } from "../../lib/wagmi";
import { deployments } from "../../contracts/PermaPassDIDRegistry";
import { fromArweaveTxidToPassportMetadataURL } from "../../lib/utils";

export default function Page() {
  const { agent } = useVeramoAgent();
  const { arweaveURI } = useLocalSearchParams();
  const [identifier, setIdentifier] = useState<IIdentifier>();
  const [passportMetadataURL, setPassportMetadataURL] = useState<string | undefined>();

  const initIdentifier = async () => {
    if (!agent) {
      console.error("Agent not initialized, exiting...");
      return;
    }

    const provider = "did:ethr:hardhat";

    console.log("Creating identifier...");
    const identifier = await agent.didManagerCreate({
      provider,
    });
    console.log("Created identifier:", identifier);
    setIdentifier(identifier);

    console.log(`Resolving ${identifier.did}...`);
    const result = await agent!.resolveDid({ didUrl: identifier.did });
    console.log(JSON.stringify(result, null, 2));

    console.log(`BlockchainAccountId: ${result.didDocument?.verificationMethod?.[0].blockchainAccountId}`);
  };

  const addService = async () => {
    if (!agent) {
      console.error("Agent not initialized, exiting...");
      return;
    }
    if (!identifier) {
      console.error("Identifier not initialized, exiting...");
      return;
    }

    console.log(`Adding service to ${identifier.did}...`);
    let result = await agent!.didManagerAddService({
      did: identifier.did,
      service: {
        id: "not supported for ethr did",
        type: "LinkedDomains",
        serviceEndpoint: arweaveURI as string,
      },
    });
    console.log("Added service to identifier");
    console.log(JSON.stringify(result, null, 2));

    console.log(`Resolving ${identifier.did}...`);
    result = await agent!.resolveDid({ didUrl: identifier.did });
    console.log(JSON.stringify(result, null, 2));

    console.log("Uploading passport metadata to Arweave...");
    const arweaveTxid = await uploadDIDPassportMetadata({
      type: "did",
      chainId: hardhat.id,
      address: deployments[hardhat.id].address,
      did: identifier.did,
      serviceId: "passport",
    });
    console.log("arweaveTxid", arweaveTxid);
    const passportMetadataURL = fromArweaveTxidToPassportMetadataURL(arweaveTxid);
    console.log("passportMetadataURL", passportMetadataURL);
    setPassportMetadataURL(passportMetadataURL);
  };

  return (
    <View>
      <Text>{arweaveURI ? `Arweave URI: ${arweaveURI}` : "No arweave URI"}</Text>
      <Button onPress={() => initIdentifier()} title={"Init Identifier"} />
      <Button onPress={() => addService()} title={"Add Service"} />
      {passportMetadataURL && (
        <>
          <Text>Passport Metadata URL:</Text>
          <Text>{passportMetadataURL}</Text>
          <NavigationButton
            to="/create/03a-use-qr-code"
            params={{
              passportMetadataURL,
            }}
          >
            Use QR Code
          </NavigationButton>
          <NavigationButton
            to="/create/03b-use-nfc"
            params={{
              passportMetadataURL,
            }}
          >
            Use NFC
          </NavigationButton>
        </>
      )}
    </View>
  );
}
