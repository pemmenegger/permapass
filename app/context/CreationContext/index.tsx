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
  status: undefined,
  errorMessage: undefined,
};

function CreationProvider({ children }: PropsWithChildren) {
  let parsedState = initialState;

  // TODO react native local storage
  //   if (typeof window !== "undefined") {
  //     const localState = window.localStorage.getItem("creationState");
  //     parsedState = localState ? (JSON.parse(localState) as CreationState) : initialState;
  //   }

  const [state, dispatch] = useReducer(creationReducer, parsedState);

  //   useEffect(() => {
  //     if (typeof window !== "undefined") {
  //       window.localStorage.setItem("creationState", JSON.stringify(state));
  //     }
  //   }, [state]);

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
