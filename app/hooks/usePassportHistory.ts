import { useState, useEffect } from "react";
import { ArweaveURI, Passport, PassportMetadata } from "../types";
import { useNFTRegistry } from "./useNFTRegistry";
import { api } from "../lib/web-api";
import { useDIDRegistry } from "./useDIDRegistry";
import { fromURIToURL } from "../lib/utils";

interface UsePassportHistoryProps {
  passportMetadata: PassportMetadata | undefined;
  version: number;
}

export function usePassportHistory({ passportMetadata, version }: UsePassportHistoryProps) {
  const [passportHistory, setPassportHistory] = useState<Passport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { nftRegistry } = useNFTRegistry();
  const { didRegistry } = useDIDRegistry();

  useEffect(() => {
    if (!passportMetadata) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        let passportVersions;
        switch (passportMetadata.type) {
          case "nft":
            passportVersions = await nftRegistry.readNFTPassportHistory(passportMetadata);
            break;
          case "did":
            passportVersions = await didRegistry.readDIDPassportHistory(passportMetadata);
            break;
          default:
            throw new Error(`Unknown passport type: ${passportMetadata}`);
        }

        if (!passportVersions || passportVersions.length === 0) {
          console.log("No passport version found");
          return [];
        }

        const passportHistory = await Promise.all(
          passportVersions.map(async (passportVersion) => {
            const passport = await api.arweave.fetchPassport(passportVersion.uri);
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
