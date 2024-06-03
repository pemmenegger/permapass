import { useNetwork } from "wagmi";
import { useCreation } from "../../context/CreationContext";
import { useDIDRegistry } from "../../hooks/blockchain/useDIDRegistry";
import { useNFTRegistry } from "../../hooks/blockchain/useNFTRegistry";
import { usePBTRegistry } from "../../hooks/blockchain/usePBTRegistry";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { HaLoNFCChipSignatureOutput, useHaLoNFCChip } from "../../hooks/useHaloNFCChip";
import { encodeDataCarrierURL } from "../../lib/utils";
import { api } from "../../lib/web-api";
import { ArweaveURI, DIDPassportMetadata, PassportMetadata } from "../../types";
import { useState } from "react";
import { useModal } from "../../context/InfoModalContext";

interface CreateDigitalIdentifierStepProps {
  createFn: (passportDataURI: ArweaveURI) => Promise<PassportMetadata | undefined>;
  description: {
    title: string;
    content: string;
    identifier: string;
  };
}

const CreateDigitalIdentifierStep = ({ createFn, description }: CreateDigitalIdentifierStepProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { state, dispatch } = useCreation();
  const { chain } = useNetwork();

  const createDigitalIdentifier = async () => {
    const passportDataURI = state.results.passportDataURI;
    if (!passportDataURI) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport URI not available" });
      return;
    }

    const passportMetadata = await createFn(passportDataURI);
    if (!passportMetadata) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport metadata not available" });
      return;
    }

    const passportMetadataURI = await api.arweave.uploadPassportMetadata(passportMetadata);
    if (!passportMetadataURI) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport metadata URI not available" });
      return;
    }

    const dataCarrierURL = encodeDataCarrierURL(passportMetadataURI);

    dispatch({ type: "RESULTS_CHANGED", dataCarrierURL });
    dispatch({ type: "CREATION_STATUS_CHANGED", status: "DIGITAL_IDENTIFIER_CREATED" });
  };

  useAsyncEffect(async () => {
    if (state.status === "PASSPORT_DATA_UPLOADED") {
      await createDigitalIdentifier();
    }
    if (state.status === "DIGITAL_IDENTIFIER_CREATED") {
      setIsCompleted(true);
    }
  }, [state.status]);

  return {
    title: description.title,
    description: (
      <>
        {description.content} {chain?.name} blockchain and will permanently exist there.
      </>
    ),
    isLoading: state.status === "PASSPORT_DATA_UPLOADED",
    isCompleted,
  };
};

export const CreateNFTStep = () => {
  const { openGasFeesModal } = useModal();
  const { nftRegistry } = useNFTRegistry();
  const { dispatch } = useCreation();

  const createNFT = (passportDataURI: ArweaveURI) => {
    return openGasFeesModal({
      content: "Creating an NFT for a passport costs gas fees.",
      onConfirm: async () => {
        try {
          if (!nftRegistry.createNFT) {
            return undefined;
          }
          return await nftRegistry.createNFT(passportDataURI);
        } catch (error) {
          return undefined;
        }
      },
      onReject: async () => {
        dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected gas fees" });
      },
    });
  };

  return CreateDigitalIdentifierStep({
    createFn: createNFT,
    description: {
      title: "Creating NFT as digital identifier",
      content: "An NFT will be minted on the",
      identifier: "nft",
    },
  });
};

export const CreatePBTStep = () => {
  const { openConfirmModal, openGasFeesModal } = useModal();
  const { pbtRegistry } = usePBTRegistry();
  const { haloNFCChip } = useHaLoNFCChip();
  const { dispatch } = useCreation();

  const computeSignatureFromChip = () => {
    return openConfirmModal({
      title: "Sign with HaLo NFC Chip",
      content:
        "Before creating a PBT, you need to sign a message with your HaLo NFC Chip. Click continue and hold your chip near your device to sign the message.",
      onConfirm: async () => {
        try {
          if (!haloNFCChip.computeSignatureFromChip) {
            return undefined;
          }
          return await haloNFCChip.computeSignatureFromChip();
        } catch (error) {
          return undefined;
        }
      },
      onReject: async () => {
        dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected signature from chip" });
      },
    });
  };

  const createPBT = (passportDataURI: ArweaveURI, chipSignature: HaLoNFCChipSignatureOutput) => {
    return openGasFeesModal({
      content: "Creating a PBT for a passport costs gas fees.",
      onConfirm: async () => {
        try {
          if (!pbtRegistry.createPBT) {
            return undefined;
          }
          return await pbtRegistry.createPBT(
            chipSignature.chipAddress,
            chipSignature.signatureFromChip,
            chipSignature.blockNumberUsedInSig,
            passportDataURI
          );
        } catch (error) {
          return undefined;
        }
      },
      onReject: async () => {
        dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected gas fees" });
      },
    });
  };

  const handlePBTCreation = async (passportDataURI: ArweaveURI) => {
    const signature = await computeSignatureFromChip();
    if (!signature) {
      return;
    }
    const { chipAddress, signatureFromChip, blockNumberUsedInSig } = signature;
    const passportMetadata = await createPBT(passportDataURI, {
      chipAddress,
      signatureFromChip,
      blockNumberUsedInSig,
    });
    return passportMetadata;
  };

  return CreateDigitalIdentifierStep({
    createFn: handlePBTCreation,
    description: {
      title: "Creating PBT as digital identifier",
      content: "A PBT will be created on the",
      identifier: "pbt",
    },
  });
};

export const CreateDIDStep = () => {
  const { openGasFeesModal } = useModal();
  const { didRegistry } = useDIDRegistry();
  const { dispatch } = useCreation();

  const createDID = () => {
    return openGasFeesModal({
      content: "Creating a DID for a passport that you control costs gas fees.",
      onConfirm: async () => {
        try {
          if (!didRegistry.createDID) {
            return undefined;
          }
          return await didRegistry.createDID();
        } catch (error) {
          return undefined;
        }
      },
      onReject: async () => {
        dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected gas fees" });
      },
    });
  };

  const addDIDService = (passportMetadata: DIDPassportMetadata, passportDataURI: ArweaveURI) => {
    return openGasFeesModal({
      content: "Linking passport data to the passport's DID costs gas fees.",
      onConfirm: async () => {
        try {
          if (!didRegistry.addDIDService) {
            return undefined;
          }
          await didRegistry.addDIDService(passportMetadata.did, passportDataURI);
        } catch (error) {
          return undefined;
        }
      },
      onReject: async () => {
        dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected gas fees" });
      },
    });
  };

  const handleDIDCreation = async (passportDataURI: ArweaveURI) => {
    const passportMetadata = await createDID();
    if (!passportMetadata) {
      return;
    }
    await addDIDService(passportMetadata, passportDataURI);
    return passportMetadata;
  };

  return CreateDigitalIdentifierStep({
    createFn: handleDIDCreation,
    description: {
      title: "Creating DID as digital identifier",
      content: "A DID will be created on the",
      identifier: "did",
    },
  });
};
