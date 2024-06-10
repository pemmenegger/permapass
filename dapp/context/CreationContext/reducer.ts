import { HaLoNFCChipSignatureOutput } from "../../hooks/useHaloNFCChip";
import { PassportCreate, DataCarrier, DigitalIdentifier, ArweaveURI } from "../../types";

export type CreationState = {
  userInput: {
    passportData?: PassportCreate;
    dataCarrier?: DataCarrier;
    digitalIdentifier?: DigitalIdentifier;
  };
  requirementNotMetMessage?: string;
  results: {
    passportDataURI?: ArweaveURI;
    passportMetadataURI?: ArweaveURI;
    haloNFCChipSignatureOutput?: HaLoNFCChipSignatureOutput;
  };
  status?:
    | "CREATION_STARTED"
    | "PASSPORT_DATA_UPLOADED"
    | "DID_OWNER_CHANGED"
    | "DID_SERVICE_ADDED"
    | "DIGITAL_IDENTIFIER_CREATED"
    | "DATA_CARRIER_INITIALIZED"
    | "CREATION_ERROR";
  errorMessage?: string;
};

export type CreationAction =
  | {
      type: "USER_INPUT_CHANGED";
      passportData?: PassportCreate;
      dataCarrier?: DataCarrier;
      digitalIdentifier?: DigitalIdentifier;
    }
  | {
      type: "REQUIREMENT_NOT_MET";
      requirementNotMetMessage?: string;
    }
  | {
      type: "CREATION_STARTED";
    }
  | {
      type: "PASSPORT_DATA_UPLOADED";
      passportDataURI: ArweaveURI;
    }
  | {
      type: "DID_OWNER_CHANGED";
    }
  | {
      type: "DID_SERVICE_ADDED";
    }
  | {
      type: "HALO_NFC_CHIP_SIGNATURE_CHANGED";
      haloNFCChipSignatureOutput: HaLoNFCChipSignatureOutput;
    }
  | {
      type: "DIGITAL_IDENTIFIER_CREATED";
      passportMetadataURI: ArweaveURI;
    }
  | {
      type: "DATA_CARRIER_INITIALIZED";
    }
  | {
      type: "CREATION_ERROR_OCCURRED";
      errorMessage: string;
    }
  | {
      type: "RESET_CREATION_STATE";
    }
  | {
      type: "RESET";
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
    case "CREATION_STARTED":
      return {
        ...state,
        status: "CREATION_STARTED",
      };
    case "PASSPORT_DATA_UPLOADED":
      return {
        ...state,
        status: "PASSPORT_DATA_UPLOADED",
        results: {
          ...state.results,
          passportDataURI: action.passportDataURI,
        },
      };
    case "DID_OWNER_CHANGED":
      return {
        ...state,
        status: "DID_OWNER_CHANGED",
      };
    case "DID_SERVICE_ADDED":
      return {
        ...state,
        status: "DID_SERVICE_ADDED",
      };
    case "HALO_NFC_CHIP_SIGNATURE_CHANGED":
      return {
        ...state,
        results: {
          ...state.results,
          haloNFCChipSignatureOutput: action.haloNFCChipSignatureOutput,
        },
      };
    case "DIGITAL_IDENTIFIER_CREATED":
      return {
        ...state,
        status: "DIGITAL_IDENTIFIER_CREATED",
        results: {
          ...state.results,
          passportMetadataURI: action.passportMetadataURI,
        },
      };
    case "DATA_CARRIER_INITIALIZED":
      return {
        ...state,
        status: "DATA_CARRIER_INITIALIZED",
      };

    case "CREATION_ERROR_OCCURRED":
      return {
        ...state,
        status: "CREATION_ERROR",
        errorMessage: action.errorMessage,
      };
    case "RESET_CREATION_STATE":
      return {
        userInput: state.userInput,
        results: {},
      };
    case "RESET":
      return {
        userInput: {},
        results: {},
      };
  }
}
