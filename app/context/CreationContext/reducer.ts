import { PassportCreate, DataCarrierType, DigitalIdentifierType } from "../../types";

export type CreationState = {
  userInput: {
    passportData?: PassportCreate;
    dataCarrier?: DataCarrierType;
    digitalIdentifier?: DigitalIdentifierType;
  };
  status?: "PASSPORT_DATA_UPLOADED" | "DIGITAL_IDENTIFIER_CREATED" | "DATA_CARRIER_SET_UP" | "CREATION_ERROR";
  errorMessage?: string;
};

export type CreationAction =
  | {
      type: "PASSPORT_DATA_CHANGED";
      passportData: PassportCreate;
    }
  | {
      type: "DATA_CARRIER_CHANGED";
      dataCarrier: DataCarrierType;
    }
  | {
      type: "DIGITAL_IDENTIFIER_CHANGED";
      digitalIdentifier: DigitalIdentifierType;
    }
  | {
      type: "CREATION_ERROR";
      errorMessage?: string;
    };

export function creationReducer(state: CreationState, action: CreationAction): CreationState {
  switch (action.type) {
    case "PASSPORT_DATA_CHANGED":
      return {
        ...state,
        userInput: {
          ...state.userInput,
          passportData: action.passportData,
        },
      };
    case "DATA_CARRIER_CHANGED":
      return {
        ...state,
        userInput: {
          ...state.userInput,
          dataCarrier: action.dataCarrier,
        },
      };
    case "DIGITAL_IDENTIFIER_CHANGED":
      return {
        ...state,
        userInput: {
          ...state.userInput,
          digitalIdentifier: action.digitalIdentifier,
        },
      };
    case "CREATION_ERROR":
      return {
        ...state,
        status: "CREATION_ERROR",
        errorMessage: action.errorMessage,
      };
  }
}
