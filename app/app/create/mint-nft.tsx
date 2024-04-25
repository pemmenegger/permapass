import { Button, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { uploadNFTPassportMetadata } from "../../lib/arweave";
import { deployments } from "../../contracts/PermaPassRegistry";
import { watchContractEvent } from "@wagmi/core";
import { walletClient, hardhat } from "../../lib/wagmi";

export default function Page() {
  const { tokenURI } = useLocalSearchParams();
  const [passportMetadataURL, setPassportMetadataURL] = useState<string | undefined>();

  const mintNFT = async () => {
    const address = walletClient.account.address;
    console.log("mintNFT - minting NFT with address: ", address);
    if (!tokenURI) {
      console.error("No token URI");
      return;
    }
    console.log("mintNFT - minting NFT with tokenURI: ", tokenURI);

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
            const arweaveHash = await uploadNFTPassportMetadata({
              chainId: hardhat.id,
              address: deployments[hardhat.id].address,
              tokenId: log.args.tokenId!,
            });
            console.log("mintNFT - arweaveHash", arweaveHash);
            const passportMetadataURL = `exp://192.168.91.91:8081/--/read?passportType=nft&arweaveHash=${arweaveHash}`;
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
      args: [address, tokenURI as string],
    });
    console.log("mintNFT - safeMint done");
  };

  return (
    <View>
      <Text>{tokenURI ? `Token URI to Mint: ${tokenURI}` : "No token URI passed"}</Text>
      <Button onPress={mintNFT} title="Mint NFT" />
      {passportMetadataURL && (
        <View>
          <Text>Encoded QR Code URL: {passportMetadataURL}</Text>
          <QRCode value={passportMetadataURL} />
        </View>
      )}
    </View>
  );
}
