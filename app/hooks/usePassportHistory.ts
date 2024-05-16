import { useState, useEffect } from "react";
import { Passport, PassportMetadata } from "../types";
import { useNFTRegistry } from "./useNFTRegistry";
import { api } from "../lib/web-api";

interface UsePassportHistoryProps {
  passportMetadata: PassportMetadata | undefined;
  version: number;
}

export function usePassportHistory({ passportMetadata, version }: UsePassportHistoryProps) {
  const [passportHistory, setPassportHistory] = useState<Passport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { nftRegistry } = useNFTRegistry();

  useEffect(() => {
    if (!passportMetadata) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        let passportURIHistory;
        switch (passportMetadata.type) {
          case "nft":
            passportURIHistory = await nftRegistry.readNFTPassportURIHistory(passportMetadata);
            break;
          // case "did":
          //   passportURIHistory = await didRegistry.readDIDPassportURIHistory(passportMetadata);
          //   break;
          default:
            throw new Error(`Unknown passport type: ${passportMetadata}`);
        }

        if (!passportURIHistory || passportURIHistory.length === 0) {
          console.log("No passport URI history found.");
          return [];
        }

        const passportHistory = await Promise.all(
          passportURIHistory.map(async (passportURI) => {
            const passportURL = api.arweave.fromURIToURL(passportURI.uri as string);
            const passport = await api.arweave.fetchPassport(passportURL);
            return passport;
          })
        );

        setPassportHistory(passportHistory);
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
  }, [passportMetadata, version]);

  return { passportHistory, isLoading, error };
}
