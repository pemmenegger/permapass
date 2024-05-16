import { useState, useEffect } from "react";
import { ArweaveURI, PassportMetadata } from "../types";
import { api } from "../lib/web-api";

interface UsePassportMetadataProps {
  metadataURI: ArweaveURI | undefined;
}

export function usePassportMetadata({ metadataURI }: UsePassportMetadataProps) {
  const [passportMetadata, setPassportMetadata] = useState<PassportMetadata | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!metadataURI) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const metadata = await api.arweave.fetchPassportMetadata(metadataURI);
        setPassportMetadata(metadata);
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
  }, [metadataURI]);

  return { passportMetadata, isLoading, error };
}
