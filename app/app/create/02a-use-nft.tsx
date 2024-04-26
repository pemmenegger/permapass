import { Button, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { uploadNFTPassportMetadata } from "../../lib/arweave";
import { deployments } from "../../contracts/PermaPassNFTRegistry";
import { watchContractEvent } from "@wagmi/core";
import { walletClient, hardhat } from "../../lib/wagmi";
import { NavigationButton } from "../../components/NavigationButton";
import { fromArweaveTxidToPassportMetadataURL } from "../../lib/utils";

export default function Page() {
  const { arweaveURI } = useLocalSearchParams();
  const [passportMetadataURL, setPassportMetadataURL] = useState<string | undefined>();

  const mintNFT = async () => {
    const address = walletClient.account.address;
    console.log("mintNFT - minting NFT with address: ", address);
    if (!arweaveURI) {
      console.error("No arweaveURI passed");
      return;
    }
    console.log("mintNFT - minting NFT with arweaveURI: ", arweaveURI);

    const unwatch = watchContractEvent(
      {
        chainId: hardhat.id,
        address: deployments[hardhat.id].address,
        abi: deployments[hardhat.id].abi,
        eventName: "Mint",
      },
      async (logs) => {
        // if multiple, most recent first
        logs.reverse();

        for (const log of logs) {
          console.log("mintNFT - event detected");
          if (log.args.to === address) {
            console.log("mintNFT - correct address, calling uploadNFTPassportMetadata...");
            console.log("mintNFT - log.args", log.args);
            const arweaveTxid = await uploadNFTPassportMetadata({
              type: "nft",
              chainId: hardhat.id,
              address: deployments[hardhat.id].address,
              tokenId: log.args.tokenId!.toString(),
            });
            console.log("mintNFT - arweaveTxid", arweaveTxid);
            const passportMetadataURL = fromArweaveTxidToPassportMetadataURL(arweaveTxid);
            console.log("mintNFT - passportMetadataURL", passportMetadataURL);
            setPassportMetadataURL(passportMetadataURL);
            break;
          }
        }
        unwatch?.();
        console.log("mintNFT - Unwatched");
      }
    );

    console.log("mintNFT - safeMint...");
    await walletClient.writeContract({
      address: deployments[hardhat.id].address,
      abi: deployments[hardhat.id].abi,
      functionName: "safeMint",
      args: [address, arweaveURI as string],
    });
    console.log("mintNFT - safeMint done");
  };

  return (
    <View>
      <Text>{arweaveURI ? `Arweave URI: ${arweaveURI}` : "No arweave URI"}</Text>
      <Button onPress={mintNFT} title="Mint NFT" />
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
