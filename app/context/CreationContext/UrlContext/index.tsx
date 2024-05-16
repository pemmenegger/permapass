import React, { createContext, useContext } from "react";
import { useURL as useURLHook } from "expo-linking";

const UrlContext = createContext<string | null>(null);

const UrlProvider = ({ children }: React.PropsWithChildren) => {
  const url = useURLHook();

  return <UrlContext.Provider value={url}>{children}</UrlContext.Provider>;
};

function useURL() {
  const context = useContext(UrlContext);
  if (context === undefined) {
    throw new Error("useURL must be used within a UrlProvider");
  }
  return context;
}

export { UrlProvider, useURL };
