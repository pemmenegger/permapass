import { Link } from "expo-router";
import { Button, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { W3mButton } from "@web3modal/wagmi-react-native";
import { useBalance, useContractRead, useNetwork, useSwitchNetwork } from "wagmi";
import { mainnet, polygon, arbitrum, hardhat, sepolia, goerli } from "viem/chains";
import { deployments } from "../../contracts/PermaPassRegistry";
import { useAccount } from "wagmi";
import { writeContract } from "@wagmi/core";
import { switchNetwork } from "@wagmi/core";
import { readContract } from "@wagmi/core";
import { watchContractEvent } from "@wagmi/core";
import { useEffect, useState } from "react";
import { uploadNFTPassportMetadata } from "../../lib/arweave";
import QRCode from "react-native-qrcode-svg";

export default function Page() {
  const { tokenURI } = useLocalSearchParams();
  const { address, isConnecting, isDisconnected } = useAccount();
  // const {  } = useBalance();
  const { chain, chains } = useNetwork();
  const [passportMetadataURL, setPassportMetadataURL] = useState<string | undefined>();

  // const { data, isError, isLoading, isSuccess } = useContractRead({
  //   chainId: hardhat.id,
  //   address: deployments[hardhat.id].address,
  //   abi: deployments[hardhat.id].abi,
  //   functionName: "tokenURI",
  //   args: [BigInt(0)],
  // });

  const mintNFT = async () => {
    if (!address) {
      console.error("No account address");
      return;
    }
    if (!tokenURI) {
      console.error("No token URI");
      return;
    }

    const unwatch = watchContractEvent(
      {
        chainId: hardhat.id,
        address: deployments[hardhat.id].address,
        abi: deployments[hardhat.id].abi,
        eventName: "Mint",
      },
      async (logs) => {
        logs.forEach(async (log) => {
          console.log("MINT: event detected");
          console.log(log);

          if (log.args.to === address) {
            console.log("MINT: Correct address");
            const url = await uploadNFTPassportMetadata({
              chainId: hardhat.id,
              address: deployments[hardhat.id].address,
              tokenId: log.args.tokenId!,
            });
            console.log(url);
            if (!url) {
              console.error("No URL returned from Arweave");
              return;
            }
            setPassportMetadataURL(url);

            unwatch?.();
            console.log("Unwatching...");
          }
        });
      }
    );

    console.log("Minting NFT with tokenURI", tokenURI);
    const result = await writeContract({
      chainId: hardhat.id,
      address: deployments[hardhat.id].address,
      abi: deployments[hardhat.id].abi,
      functionName: "safeMint",
      args: [address, tokenURI as string],
    });

    console.log(result);
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

  const switchNetworkInternal = async (chainId: number) => {
    const result = await switchNetwork({ chainId: chainId });
    console.log(result);
  };

  return (
    <View>
      {chain && <Text>Connected to {chain.name}</Text>}
      {/* {chains && <Text>Available chains: {chains.map((chain) => chain.name)}</Text>} */}

      <W3mButton />
      {/* {isLoading && <Text>Loading</Text>}
      {isSuccess && <Text>Response: {data?.toString()}</Text>}
      {isError && <Text>Error reading contract</Text>} */}
      <Button onPress={mintNFT} title="Mint NFT" />
      {passportMetadataURL && <Text>Token URI: {passportMetadataURL}</Text>}
      {passportMetadataURL && (
        <View>
          <Text>QR Code</Text>
          <QRCode value={passportMetadataURL} />
        </View>
      )}
      {/* <Button onPress={() => switchNetworkInternal(sepolia.id)} title="Switch to Sepolia" />
      <Button onPress={() => switchNetworkInternal(hardhat.id)} title="Switch to Hardhat" /> */}
    </View>
  );
}
