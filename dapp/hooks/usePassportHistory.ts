import { useState, useEffect } from "react";
import { PassportMetadata, PassportRead } from "../types";
import { api } from "../lib/web-api";
import { useContracts } from "./blockchain/useContracts";

interface UsePassportHistoryProps {
  passportMetadata: PassportMetadata | undefined;
  version: number;
}

export function usePassportHistory({ passportMetadata, version }: UsePassportHistoryProps) {
  const [passportHistory, setPassportHistory] = useState<PassportRead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { nftRegistry, pbtRegistry, didRegistry } = useContracts();

  useEffect(() => {
    setPassportHistory([]);
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
          case "pbt":
            passportVersions = await pbtRegistry.readPBTPassportHistory(passportMetadata);
            break;
          case "did":
            passportVersions = await didRegistry.readDIDPassportHistory(passportMetadata);
            break;
          default:
            throw new Error(`Unknown passport type: ${JSON.stringify(passportMetadata)}`);
        }

        if (!passportVersions || passportVersions.length === 0) {
          console.log("No passport version found");
          return [];
        }

        const passportHistory: PassportRead[] = await Promise.all(
          passportVersions.map(async (passportVersion) => {
            const passport = await api.arweave.fetchPassport(passportVersion.uri);
            return {
              data: passport,
              version: passportVersion,
            };
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
