import { View, Text, Button } from "react-native";
import { NavigationButton } from "../components/NavigationButton";
import { api } from "../lib/web-api";
import { DIDDocument } from "../types/did";
import { useState } from "react";
import { PermaPassDIDRegistry } from "../contracts/PermaPassDIDRegistry";
import { hardhat } from "../lib/wagmi";
import { blockchain } from "../lib/blockchain";

export default function Page() {
  const [did, setDid] = useState<string | null>(null);
  const [didDocument, setDidDocument] = useState<DIDDocument | null>(null);

  const resolveSepolia = async () => {
    const didUrl = "did:ethr:sepolia:0x3b0bc51ab9de1e5b7b6e34e5b960285805c41736";
    const didDocument = await api.veramo.resolveDID(didUrl);
    console.log("Resolved Sepolia DID:", didDocument);
    setDidDocument(didDocument);
  };

  const resolveHardhat = async () => {
    // const didUrl = "did:ethr:hardhat:0x3b0bc51ab9de1e5b7b6e34e5b960285805c41736";
    const didUrl = "did:ethr:hardhat:0x9678bA56F7A8516bCBAaC12a63CF2F73Ab8FAAf4";
    const registryAddress = PermaPassDIDRegistry[hardhat.id].address;
    console.log("Registry Address:", registryAddress);
    const didDocument = await api.veramo.resolveDID(didUrl, registryAddress);
    console.log("Resolved Hardhat DID:", didDocument);
    setDidDocument(didDocument);
  };

  const createDID = async () => {
    const didUrl = await blockchain.createDID();
    console.log("Created DID:", didUrl);
    const registryAddress = PermaPassDIDRegistry[hardhat.id].address;
    const didDocument = await api.veramo.resolveDID(didUrl, registryAddress);
    console.log("Resolved DID:", didDocument);
    setDidDocument(didDocument);
  };

  return (
    <View>
      <Text>Welcome to PermaPass</Text>
      <NavigationButton to="/create/01-set-passport-data">Create Passport</NavigationButton>
      <NavigationButton to="/connect">Connect Wallet</NavigationButton>
      <NavigationButton to="/nfc">Read/Write HaLo NFC</NavigationButton>
      <Button title="Resolve Sepolia DID" onPress={resolveSepolia} />
      <Button title="Resolve Hardhat DID" onPress={resolveHardhat} />
      <Button title="Create Hardhat DID" onPress={createDID} />
      {didDocument && <Text>{JSON.stringify(didDocument, null, 2)}</Text>}
    </View>
  );
}
