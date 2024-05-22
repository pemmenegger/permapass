import { parse } from "expo-linking";
import { useState, useEffect } from "react";
import { ArweaveURI } from "../types";
import { useURL } from "../context/UrlContext";

export function useReadQueryParams() {
  const [metadataURI, setMetadataURI] = useState<ArweaveURI | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const url = useURL();

  useEffect(() => {
    console.log("useReadQueryParams - url:", url);
    if (!url) return;

    const runAsync = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const queryParams = url ? parse(url).queryParams : {};
        console.log("useReadQueryParams - queryParams:", queryParams);
        const metadataURI = typeof queryParams?.metadataURI === "string" ? queryParams.metadataURI : undefined;
        if (!metadataURI) {
          throw new Error("metadataURI not found in query parameters");
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
