import React from "react";
import { View, Button } from "react-native";
import { NavigationButton } from "../components/NavigationButton";
// import { ethers } from "ethers";
// import { deployments } from "../contracts/PermaPassRegistry";

export default function Page() {
  // const initSigner = async () => {
  //   const MACBOOK_IP = "192.168.91.91";
  //   const NODE_URL = `http://${MACBOOK_IP}:8545`;
  //   const PRIVATE_KEY = "9ef7a075b8356816a2ca76859f28a8ea8b121e5fe2d00ec2c346ce7579079fc9";
  //   const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
  //   const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  //   return signer;
  // };

  // const callContractFunction = async () => {
  //   const signer = await initSigner();
  //   const contractAddress = deployments[31337].address;
  //   const abi = deployments[31337].abi;
  //   const contract = new ethers.Contract(contractAddress, abi, signer);
  //   try {
  //     const tx = await contract.doSomething();
  //     await tx.wait();
  //     console.log("Transaction successful:", tx);
  //   } catch (error) {
  //     console.error("Transaction failed:", error);
  //   }
  // };

  return (
    <View>
      <NavigationButton to="/create/upload-passport-data">Create</NavigationButton>
      {/* <Button title="Call Contract Function" onPress={callContractFunction} /> */}
    </View>
  );
}
