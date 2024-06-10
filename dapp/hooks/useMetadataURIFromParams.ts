import { useState } from "react";
import { ArweaveURI } from "../types";
import { useLocalSearchParams } from "expo-router";
import { useAsyncEffect } from "./useAsyncEffect";

export function useMetadataURIFromParams() {
  const [metadataURI, setMetadataURI] = useState<ArweaveURI | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { metadataURI: queryParamsMetadataURI } = useLocalSearchParams();

  useAsyncEffect(async () => {
    if (!queryParamsMetadataURI) return;

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
  }, [queryParamsMetadataURI]);

  return { metadataURI, isLoading, error };
}
