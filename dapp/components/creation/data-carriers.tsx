import { useCreation } from "../../context/CreationContext";
import { useState } from "react";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useModal } from "../../context/ModalContext";
import { HaLoNFCChipSignatureOutput } from "../../hooks/useHaloNFCChip";
import { ArweaveURI } from "../../types";
import { useContracts } from "../../hooks/blockchain/useContracts";

interface DataCarrierStepProps {
  initFn: () => Promise<void>;
  description: {
    title: string;
    content: string;
    identifier: string;
  };
}

const DataCarrierStep = ({ initFn, description }: DataCarrierStepProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { state, dispatch } = useCreation();

  const initDataCarrier = async () => {
    try {
      await initFn();
      dispatch({ type: "DATA_CARRIER_INITIALIZED" });
    } catch (error) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Failed to initialize data carrier" });
    }
  };

  useAsyncEffect(async () => {
    if (state.status === "DIGITAL_IDENTIFIER_CREATED") {
      await initDataCarrier();
    }
    if (state.status === "DATA_CARRIER_INITIALIZED") {
      setIsCompleted(true);
    }
  }, [state.status]);

  return {
    title: description.title,
    description: <>{description.content}</>,
    isLoading: state.status === "DIGITAL_IDENTIFIER_CREATED",
    isCompleted,
  };
};

export const GenerateQRCodeStep = () => {
  const initQRCode = async () => {
    // qr code will be generated on the success page
  };

  return DataCarrierStep({
    initFn: initQRCode,
    description: {
      title: "Generating QR Code as data carrier",
      content: "A QR Code linking to the digital identifier and passport data will be generated.",
      identifier: "QR Code",
    },
  });
};

export const WriteHaLoChipStep = () => {
  const { openGasFeesModal, openChipSignatureModal } = useModal();
  const { state, dispatch } = useCreation();
  const { haLoNFCMetadataRegistry } = useContracts();

  const computeSignatureFromChip = () => {
    return openChipSignatureModal({
      content: "Before linking this HaLo NFC Chip to passport metadata, you need to sign a message.",
      onReject: async () => {
        dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected signature from chip" });
      },
    });
  };

  const writeMetadataURIToBlockchain = (chipSignature: HaLoNFCChipSignatureOutput, metadataURI: ArweaveURI) => {
    return openGasFeesModal({
      content: "Linking passport metadata to the HaLo NFC Chip costs gas fees.",
      onConfirm: async () => {
        try {
          if (!haLoNFCMetadataRegistry.initMetadataURI) {
            return undefined;
          }
          return await haLoNFCMetadataRegistry.initMetadataURI(chipSignature, metadataURI);
        } catch (error) {
          return undefined;
        }
      },
      onReject: async () => {
        dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected gas fees" });
      },
    });
  };

  const initHaloNFCChip = async () => {
    const { passportMetadataURI, haloNFCChipSignatureOutput } = state.results;
    if (!passportMetadataURI) {
      throw new Error("Passport metadata URI not available");
    }

    let chipSignature = haloNFCChipSignatureOutput;
    if (!chipSignature) {
      chipSignature = await computeSignatureFromChip();
      if (!chipSignature) {
        throw new Error("Failed to compute signature from chip");
      }
      dispatch({ type: "HALO_NFC_CHIP_SIGNATURE_CHANGED", haloNFCChipSignatureOutput: chipSignature });
    }

    await writeMetadataURIToBlockchain(chipSignature, passportMetadataURI);
  };

  return DataCarrierStep({
    initFn: initHaloNFCChip,
    description: {
      title: "Writing to HaLo NFC Chip",
      content: "The passport data will be written to the HaLo NFC chip.",
      identifier: "HaLo NFC Chip",
    },
  });
};
