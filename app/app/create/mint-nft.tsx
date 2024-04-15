import { Link } from "expo-router";
import { Button, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { W3mButton } from "@web3modal/wagmi-react-native";
import { useContractRead, erc721ABI, useNetwork, useContractWrite } from "wagmi";
import { mainnet, polygon, arbitrum, hardhat } from "viem/chains";
import { deployments } from "../../contracts/PermaPassRegistry";
import { useAccount } from "wagmi";

export default function Page() {
  const { tokenURI } = useLocalSearchParams();
  const { address, isConnecting, isDisconnected } = useAccount();

  const network = useNetwork();

  const { data, isError, isLoading, isSuccess } = useContractRead({
    chainId: hardhat.id,
    address: deployments[hardhat.id].address,
    abi: deployments[hardhat.id].abi,
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  // TODO mint nft

  const mintNFT = async () => {
    if (!address) {
      console.error("No account address");
      return;
    }
    if (!tokenURI) {
      console.error("No token URI");
      return;
    }
    const {
      data: mintData,
      isError: mintIsError,
      isLoading: mintIsLoading,
      isSuccess: mintIsSuccess,
    } = useContractWrite({
      chainId: hardhat.id,
      address: deployments[hardhat.id].address,
      abi: deployments[hardhat.id].abi,
      functionName: "safeMint",
      args: [address, tokenURI as string],
    });

    if (mintIsError) {
      console.error("Error minting NFT");
    }
    if (mintIsLoading) {
      console.log("Minting NFT");
    }
    if (mintIsSuccess) {
      console.log("NFT minted");
    }
  };

  // TODO upload nft passport data to arweave

  // TODO generate qr code to arweave link

  return (
    <View>
      <Text>Network ID: {network?.chain?.name}</Text>
      <Text>Read Screen</Text>
      <Text>TokenURI: {tokenURI}</Text>
      <W3mButton />
      {isLoading && <Text>Loading</Text>}
      {isSuccess && <Text>Response: {data?.toString()}</Text>}
      {isError && <Text>Error reading contract</Text>}
      <Button onPress={mintNFT} title="Mint NFT" />
    </View>
  );
}
