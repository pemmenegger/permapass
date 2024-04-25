import { Button, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import QRCode from "react-native-qrcode-svg";

export default function Page() {
  const { tokenURI } = useLocalSearchParams();
  const [passportMetadataURL, setPassportMetadataURL] = useState<string | undefined>();

  const mintNFT = async () => {
    console.log("Minting NFT to be impoemented");
    // if (!address) {
    //   console.error("No account address");
    //   return;
    // }
    // if (!tokenURI) {
    //   console.error("No token URI");
    //   return;
    // }

    // const unwatch = watchContractEvent(
    //   {
    //     chainId: hardhat.id,
    //     address: deployments[hardhat.id].address,
    //     abi: deployments[hardhat.id].abi,
    //     eventName: "Mint",
    //   },
    //   async (logs) => {
    //     logs.forEach(async (log) => {
    //       console.log("MINT: event detected");
    //       console.log(log);

    //       if (log.args.to === address) {
    //         console.log("MINT: Correct address");
    //         const arweaveHash = await uploadNFTPassportMetadata({
    //           chainId: hardhat.id,
    //           address: deployments[hardhat.id].address,
    //           tokenId: log.args.tokenId!,
    //         });
    //         const url = fromArweaveHashToURL(arweaveHash);
    //         console.log(url);
    //         if (!url) {
    //           console.error("No URL returned from Arweave");
    //           return;
    //         }

    //         //192.168.91.91:8081/--/read?passportType=nft&arweaveHash=4uABXvFuIsPdue9Q1xW7jieF3RFATYWxIWRz5zMKuAg

    //         setPassportMetadataURL(`exp://192.168.91.91:8081/--/read?passportType=nft&arweaveHash=${arweaveHash}`);

    //         unwatch?.();
    //         console.log("Unwatching...");
    //       }
    //     });
    //   }
    // );

    // console.log("Minting NFT with tokenURI", tokenURI);
    // const result = await writeContract({
    //   chainId: hardhat.id,
    //   address: deployments[hardhat.id].address,
    //   abi: deployments[hardhat.id].abi,
    //   functionName: "safeMint",
    //   args: [address, tokenURI as string],
    // });

    // console.log(result);
  };

  // const readNFT = async () => {
  //   const result = await readContract({
  //     chainId: hardhat.id,
  //     address: deployments[hardhat.id].address,
  //     abi: deployments[hardhat.id].abi,
  //     functionName: "tokenURI",
  //     args: [BigInt(0)],
  //   });

  //   console.log(result);
  // };

  return (
    <View>
      <Text>{tokenURI ? `Token URI to Mint: ${tokenURI}` : "No token URI passed"}</Text>
      <Button onPress={mintNFT} title="Mint NFT" />
      {passportMetadataURL && <Text>Token URI: {passportMetadataURL}</Text>}
      {passportMetadataURL && (
        <View>
          <Text>QR Code</Text>
          <QRCode value={passportMetadataURL} />
        </View>
      )}
    </View>
  );
}
