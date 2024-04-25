import { useState, useEffect } from "react";
import { Passport, PassportMetadata, PassportType } from "../types";
import { fromArweaveHashToURL } from "../arweave";
import { readContract } from "@wagmi/core";
import { Address } from "viem";

interface UsePassportProps {
  passportType: PassportType | undefined;
  arweaveHash: string | undefined;
}

export function usePassport({ passportType, arweaveHash }: UsePassportProps) {
  const [passport, setPassport] = useState<Passport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async (url: string): Promise<PassportMetadata> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error while fetching metadata, status: ${response.status}`);
    return response.json();
  };

  const fetchPassportURL = async (passportType: PassportType, metadata: PassportMetadata): Promise<string> => {
    switch (passportType) {
      case "nft":
        const tokenURI = await readContract({
          chainId: metadata.chainId,
          address: metadata.address as Address,
          abi: metadata.abi,
          functionName: metadata.functionName,
          args: metadata.args.map((arg) => BigInt(arg)),
        });
        return tokenURI as string;
      case "did":
        throw new Error("DID not supported yet");
      default:
        throw new Error(`Unknown passport type: ${passportType}`);
    }
  };

  const fetchPassport = async (url: string): Promise<Passport> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error while fetching data, status: ${response.status}`);
    return response.json();
  };

  useEffect(() => {
    if (!passportType || !arweaveHash) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const metadataURL = fromArweaveHashToURL(arweaveHash);
        const metadata = await fetchMetadata(metadataURL);
        const passportURL = await fetchPassportURL(passportType, metadata);
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
  }, [passportType, arweaveHash]);

  return { passport, isLoading, error };
}
