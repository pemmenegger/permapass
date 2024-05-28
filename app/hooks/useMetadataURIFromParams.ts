import { useState, useEffect } from "react";
import { ArweaveURI } from "../types";
import { useLocalSearchParams } from "expo-router";

export function useMetadataURIFromParams() {
  const [metadataURI, setMetadataURI] = useState<ArweaveURI | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { metadataURI: queryParamsMetadataURI } = useLocalSearchParams();

  useEffect(() => {
    if (!queryParamsMetadataURI) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        if (!queryParamsMetadataURI) {
          throw new Error("metadataURI not found in URL or local search params");
        }
        setMetadataURI(queryParamsMetadataURI as ArweaveURI);
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
  }, [queryParamsMetadataURI]);

  return { metadataURI, isLoading, error };
}
