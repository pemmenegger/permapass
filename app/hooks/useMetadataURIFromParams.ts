import { parse } from "expo-linking";
import { useState, useEffect } from "react";
import { ArweaveURI } from "../types";
import { useURL } from "../context/UrlContext";
import { useLocalSearchParams } from "expo-router";

export function useMetadataURIFromParams() {
  const [metadataURI, setMetadataURI] = useState<ArweaveURI | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { metadataURI: metadataURIFromLocalSearchParams } = useLocalSearchParams();
  const url = useURL();

  useEffect(() => {
    if (!url) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const queryParams = url ? parse(url).queryParams : {};

        let metadataURI;
        if (typeof queryParams?.metadataURI === "string") {
          metadataURI = queryParams.metadataURI;
        } else if (metadataURIFromLocalSearchParams) {
          metadataURI = metadataURIFromLocalSearchParams;
        }

        if (!metadataURI) {
          throw new Error("metadataURI not found in URL or local search params");
        }

        setMetadataURI(metadataURI as ArweaveURI);
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
  }, [url]);

  return { metadataURI, isLoading, error };
}
