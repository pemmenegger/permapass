import { useState, useEffect } from "react";
import { Passport, PassportMetadata } from "../types";
import { readPassport } from "../lib/utils";

interface UsePassportProps {
  passportMetadata: PassportMetadata | undefined;
  version: number;
}

export function usePassport({ passportMetadata, version }: UsePassportProps) {
  const [passport, setPassport] = useState<Passport | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!passportMetadata) return;

    console.log(JSON.stringify(passportMetadata));

    const runAsync = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const passport = await readPassport(passportMetadata);
        console.log("usePassport - passport", passport);
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
  }, [passportMetadata, version]);

  return { passport, isLoading, error };
}
