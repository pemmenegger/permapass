import React, { type PropsWithChildren, createContext, useReducer, useContext, useEffect } from "react";
import { type CreationAction, type CreationState, creationReducer } from "./reducer";

interface CreationContentType {
  state: CreationState;
  dispatch: (action: CreationAction) => void;
}

const CreationContext = createContext<CreationContentType | undefined>(undefined);

const initialState: CreationState = {
  userInput: {
    passportData: undefined,
    dataCarrier: undefined,
    digitalIdentifier: undefined,
  },
  results: {
    passportDataURI: undefined,
    dataCarrierURL: undefined,
  },
};

function CreationProvider({ children }: PropsWithChildren) {
  let parsedState = initialState;

  const [state, dispatch] = useReducer(creationReducer, parsedState);

  const value = { state, dispatch };

  return <CreationContext.Provider value={value}>{children}</CreationContext.Provider>;
}

function useCreation() {
  const context = useContext(CreationContext);
  if (context === undefined) {
    throw new Error("useCreation must be used within a CreationProvider");
  }
  return context;
}

export { CreationProvider, CreationContext, useCreation };
