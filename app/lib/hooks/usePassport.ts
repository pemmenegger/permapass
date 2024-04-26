import { useState, useEffect } from "react";
import { Passport, PassportMetadata } from "../types";
import { fromArweaveTxidToURL, fromArweaveURIToURL } from "../arweave";
import { readContract, erc721ABI } from "@wagmi/core";
import { Address } from "viem";
import { useVeramoAgent } from "./useVeramoAgent";

interface UsePassportProps {
  arweaveTxid: string | undefined;
}

export function usePassport({ arweaveTxid }: UsePassportProps) {
  const [passport, setPassport] = useState<Passport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async (url: string): Promise<PassportMetadata> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error while fetching metadata, status: ${response.status}`);
    return response.json();
  };

  const fetchPassportURL = async (metadata: PassportMetadata): Promise<string> => {
    switch (metadata.type) {
      case "nft":
        const arweaveURI = await readContract({
          chainId: metadata.chainId,
          address: metadata.address as Address,
          abi: erc721ABI,
          functionName: "tokenURI",
          args: [BigInt(metadata.tokenId)],
        });
        return fromArweaveURIToURL(arweaveURI as string);
      case "did":
        const { agent } = useVeramoAgent();
        const result = await agent.resolveDid({ didUrl: metadata.did });
        const services = result.didDocument?.service || [];
        for (const service of services) {
          if (service.type === "LinkedDomains") {
            const arweaveURI = service.serviceEndpoint;
            return fromArweaveURIToURL(arweaveURI as string);
          }
        }
        return "Service not found.";
      default:
        throw new Error(`Unknown passport type: ${metadata}`);
    }
  };

  const fetchPassport = async (url: string): Promise<Passport> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error while fetching data, status: ${response.status}`);
    return response.json();
  };

  useEffect(() => {
    if (!arweaveTxid) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const metadataURL = fromArweaveTxidToURL(arweaveTxid);
        const metadata = await fetchMetadata(metadataURL);
        const passportURL = await fetchPassportURL(metadata);
        const passport = await fetchPassport(passportURL);
        setPassport(passport);
      } catch (error: unknown) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
          errorMessage = `Loading data failed: ${error.message}`;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void runAsync();
  }, [arweaveTxid]);

  return { passport, isLoading, error };
}
