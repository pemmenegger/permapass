import { useState } from "react";
import { PassportHistory, PassportMetadata } from "../types";
import { api } from "../lib/web-api";
import { useContracts } from "./blockchain/useContracts";
import { useAsyncEffect } from "./useAsyncEffect";

interface UsePassportHistoryProps {
  passportMetadata: PassportMetadata | undefined;
  version: number;
}

export function usePassportHistory({ passportMetadata, version }: UsePassportHistoryProps) {
  const [passportHistory, setPassportHistory] = useState<PassportHistory | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { nftRegistry, pbtRegistry, didRegistry } = useContracts();

  useAsyncEffect(async () => {
    setPassportHistory(undefined);
    if (!passportMetadata) return;

    setIsLoading(true);
    setError(undefined);

    try {
      let passportDetails;
      let ownerAddress;
      switch (passportMetadata.type) {
        case "nft":
          passportDetails = await nftRegistry.readNFTPassportHistory(passportMetadata);
          ownerAddress = await nftRegistry.ownerOf(passportMetadata);
          break;
        case "pbt":
          passportDetails = await pbtRegistry.readPBTPassportHistory(passportMetadata);
          ownerAddress = await pbtRegistry.ownerOf(passportMetadata);
          break;
        case "did":
          passportDetails = await didRegistry.readDIDPassportHistory(passportMetadata);
          ownerAddress = await didRegistry.ownerOf(passportMetadata);
          break;
        default:
          throw new Error(`Unknown passport type: ${JSON.stringify(passportMetadata)}`);
      }

      if (passportDetails.length === 0) {
        console.log("No passport version found");
        return;
      }

      const passportHistory: PassportHistory = {
        entries: await Promise.all(
          passportDetails.map(async (details) => {
            const passport = await api.arweave.fetchPassport(details.uri);
            return {
              data: passport,
              details,
            };
          })
        ),
        ownerAddress,
      };

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
  }, [passportMetadata, version]);

  return { passportHistory, isLoading, error };
}
