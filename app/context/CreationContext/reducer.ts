import { PassportCreate, DataCarrierType, DigitalIdentifierType, ArweaveURI } from "../../types";

export type CreationState = {
  userInput: {
    passportData?: PassportCreate;
    dataCarrier?: DataCarrierType;
    digitalIdentifier?: DigitalIdentifierType;
  };
  requirementNotMetMessage?: string;
  results: {
    passportDataURI?: ArweaveURI;
    dataCarrierURL?: string;
  };
  status?:
    | "CREATION_STARTED"
    | "PASSPORT_DATA_UPLOADED"
    | "DID_OWNER_CHANGED"
    | "DID_SERVICE_ADDED"
    | "DIGITAL_IDENTIFIER_CREATED"
    | "QR_CODE_GENERATED"
    | "HALO_NFC_WRITTEN"
    | "CREATION_ERROR";
  errorMessage?: string;
};

export type CreationAction =
  | {
      type: "USER_INPUT_CHANGED";
      passportData?: PassportCreate;
      dataCarrier?: DataCarrierType;
      digitalIdentifier?: DigitalIdentifierType;
    }
  | {
      type: "REQUIREMENT_NOT_MET";
      requirementNotMetMessage?: string;
    }
  | {
      type: "RESULTS_CHANGED";
      passportDataURI?: ArweaveURI;
      dataCarrierURL?: string;
    }
  | {
      type: "CREATION_STATUS_CHANGED";
      status: CreationState["status"];
    }
  | {
      type: "CREATION_ERROR_OCCURRED";
      errorMessage: string;
    };

export function creationReducer(state: CreationState, action: CreationAction): CreationState {
  switch (action.type) {
    case "USER_INPUT_CHANGED":
      return {
        ...state,
        userInput: {
          ...state.userInput,
          passportData: action.passportData ? action.passportData : state.userInput.passportData,
          dataCarrier: action.dataCarrier ? action.dataCarrier : state.userInput.dataCarrier,
          digitalIdentifier: action.digitalIdentifier ? action.digitalIdentifier : state.userInput.digitalIdentifier,
        },
      };
    case "REQUIREMENT_NOT_MET":
      return {
        ...state,
        requirementNotMetMessage: action.requirementNotMetMessage,
      };
    case "RESULTS_CHANGED":
      return {
        ...state,
        results: {
          ...state.results,
          passportDataURI: action.passportDataURI ? action.passportDataURI : state.results.passportDataURI,
          dataCarrierURL: action.dataCarrierURL ? action.dataCarrierURL : state.results.dataCarrierURL,
        },
      };
    case "CREATION_STATUS_CHANGED":
      return {
        ...state,
        status: action.status,
      };
    case "CREATION_ERROR_OCCURRED":
      return {
        ...state,
        status: "CREATION_ERROR",
        errorMessage: action.errorMessage,
      };
  }
}
