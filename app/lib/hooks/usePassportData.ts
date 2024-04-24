import { useState, useEffect } from "react";
import { PassportData, PassportMetadata } from "../types";
import { Address } from "viem";
import { readContract } from "@wagmi/core";

interface UsePassportDataReturn {
  data: PassportData | null;
  isLoading: boolean;
  error: string | null;
}

export function usePassportData(metadataURL: string | undefined): UsePassportDataReturn {
  const [metadata, setMetadata] = useState<PassportMetadata | null>(null);
  const [dataURL, setDataURL] = useState<string | undefined>();
  const [data, setData] = useState<PassportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(metadataURL!);
        if (!response.ok) {
          throw new Error(`HTTP(S) error! url: ${metadataURL} status: ${response.status}`);
        }
        const jsonData: PassportMetadata = await response.json();
        setMetadata(jsonData);
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (metadataURL) {
      fetchMetadata();
    }
  }, [metadataURL]);

  useEffect(() => {
    const fetchDataURL = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const tokenURI = await readContract({
          chainId: metadata!.chainId,
          address: metadata!.address as Address,
          abi: metadata!.abi,
          functionName: metadata!.functionName,
          args: metadata!.args.map((arg) => BigInt(arg)),
        });
        const dataURL = tokenURI as string;
        console.log("Passport Data URL", dataURL);
        setDataURL(dataURL);
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (metadata) {
      fetchDataURL();
    }
  }, [metadata]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(dataURL!);
        if (!response.ok) {
          throw new Error(`HTTP(S) error! url: ${dataURL} status: ${response.status}`);
        }
        const jsonData: PassportData = await response.json();
        setData(jsonData);
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (dataURL) {
      fetchData();
    }
  }, [dataURL]);

  return { data, isLoading, error };
}
