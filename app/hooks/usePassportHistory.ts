import { useState, useEffect } from "react";
import { Passport, PassportMetadata } from "../types";
import { readPassportHistory } from "../lib/utils";

interface UsePassportHistoryProps {
  passportMetadata: PassportMetadata | undefined;
  version: number;
}

export function usePassportHistory({ passportMetadata, version }: UsePassportHistoryProps) {
  const [passportHistory, setPassportHistory] = useState<Passport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!passportMetadata) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const passportHistory = await readPassportHistory(passportMetadata);
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
