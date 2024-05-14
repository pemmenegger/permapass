import { useState, useEffect } from "react";
import { PassportMetadata } from "../types";
import { readPassportMetadata } from "../lib/utils";

interface UsePassportMetadataProps {
  arweaveTxid: string | undefined;
}

export function usePassportMetadata({ arweaveTxid }: UsePassportMetadataProps) {
  const [passportMetadata, setPassportMetadata] = useState<PassportMetadata | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!arweaveTxid) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const metadata = await readPassportMetadata(arweaveTxid);
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
  }, [arweaveTxid]);

  return { passportMetadata, isLoading, error };
}
