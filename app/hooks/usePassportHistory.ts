// import { useState, useEffect } from "react";
// import { DIDPassportMetadata, NFTPassportMetadata, Passport, PassportRead, PassportMetadata } from "../types";
// import {arweave} from "../arweave";
// import { readContract, erc721ABI } from "@wagmi/core";
// import { Address } from "viem";
// import { useVeramoAgent } from "./useVeramoAgent";
// import { hardhat, publicClient } from "../wagmi";
// import { deployments } from "../../contracts/PermaPassNFTRegistry";

// interface UsePassportHistoryProps {
//   passportMetadata: PassportMetadata | undefined;
// }

// export function usePassportHistory({ passportMetadata }: UsePassportHistoryProps) {
//   const [passportHistory, setPassportHistory] = useState<Passport[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | undefined>(undefined);

//   const fetchPassport = async (url: string): Promise<Passport> => {
//     const response = await fetch(url);
//     if (!response.ok) throw new Error(`HTTP error while fetching data, status: ${response.status}`);
//     return response.json();
//   };

//   const fetchNFTPassport = async (metadata: NFTPassportMetadata): Promise<Passport> => {
//     const arweaveURI = await readContract({
//       chainId: metadata.chainId,
//       address: metadata.address as Address,
//       abi: erc721ABI,
//       functionName: "tokenURI",
//       args: [BigInt(metadata.tokenId)],
//     });
//     const url = arweave.fromURIToURL(arweaveURI as string);
//     return fetchPassport(url);
//   };

//   const fetchDIDPassport = async (metadata: DIDPassportMetadata): Promise<Passport> => {
//     const { agent } = useVeramoAgent();
//     const result = await agent.resolveDid({ didUrl: metadata.did });
//     const services = result.didDocument?.service || [];
//     for (const service of services) {
//       if (service.type === "LinkedDomains") {
//         const arweaveURI = service.serviceEndpoint;
//         const url = arweave.fromURIToURL(arweaveURI as string);
//         return fetchPassport(url);
//       }
//     }
//     throw new Error("Service not found.");
//   };

//   const fetchPassportURL = async (metadata: PassportMetadata): Promise<string> => {
//     switch (metadata.type) {
//       case "nft":
//         const arweaveURI = await readContract({
//           chainId: metadata.chainId,
//           address: metadata.address as Address,
//           abi: erc721ABI,
//           functionName: "tokenURI",
//           args: [BigInt(metadata.tokenId)],
//         });
//         return arweave.fromURIToURL(arweaveURI as string);
//       case "did":
//         const { agent } = useVeramoAgent();
//         const result = await agent.resolveDid({ didUrl: metadata.did });
//         const services = result.didDocument?.service || [];
//         for (const service of services) {
//           if (service.type === "LinkedDomains") {
//             const arweaveURI = service.serviceEndpoint;
//             return arweave.fromURIToURL(arweaveURI as string);
//           }
//         }
//         return "Service not found.";
//       default:
//         throw new Error(`Unknown passport type: ${metadata}`);
//     }
//   };

//   useEffect(() => {
//     if (!passportMetadata) return;

//     const runAsync = async () => {
//       setIsLoading(true);
//       setError(undefined);

//       try {
//         if (passportMetadata.type === "nft") {
//           const history = [];
//           const { tokenId } = passportMetadata;

//           let previousChange: bigint = await readContract({
//             chainId: hardhat.id,
//             address: deployments[hardhat.id].address,
//             abi: deployments[hardhat.id].abi,
//             functionName: "changed",
//             args: [tokenId],
//           });

//           while (previousChange) {
//             const events = await publicClient.getContractEvents({
//               address: passportMetadata.address as Address,
//               abi: deployments[hardhat.id].abi,
//               eventName: "TokenURIChanged",
//               args: { tokenId },
//               fromBlock: previousChange,
//               toBlock: previousChange,
//             });

//             const block = await publicClient.getBlock({ blockNumber: previousChange });

//             const fetchPassportPromises = events.map((event) => {

//             }
//               fetchPassport(event.args.uri!).then((passport) => ({
//                 ...passport,
//                 version: event.args.version!,
//                 timestamp: block.timestamp,
//                 sender: event.args.sender!,
//               }))
//             );

//             try {
//               const passports: PassportRead[] = await Promise.all(fetchPassportPromises);
//               passports.sort((a, b) => Number(b.version) - Number(a.version));
//               history.unshift(...passports);
//               console.log("passports", passports);

//               const lastEvent = events[events.length - 1];
//               previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
//             } catch (error) {
//               console.error("Failed to process events due to:", error);
//               break;
//             }
//           }

//           console.log("history", history);

//           return;
//         }

//         const currentPassportURL = await fetchPassportURL(passportMetadata);

//         const currentPassport = await fetchPassport(currentPassportURL);
//         setPassportHistory((prevPassportHistory) => [...prevPassportHistory, currentPassport]);
//       } catch (error: unknown) {
//         let errorMessage = "Unknown error occurred";
//         if (error instanceof Error) {
//           errorMessage = `Loading data failed: ${error.message}`;
//         }
//         setError(errorMessage);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     void runAsync();
//   }, [passportMetadata]);

//   return { passportHistory, isLoading, error };
// }
