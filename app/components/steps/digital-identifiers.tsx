import { useCreation } from "../../context/CreationContext";
import { CreationAction, CreationState } from "../../context/CreationContext/reducer";
import { useModal } from "../../context/InfoModalContext";
import { ConfirmModal } from "../../context/InfoModalContext/modals";
import { useDIDRegistry } from "../../hooks/blockchain/useDIDRegistry";
import { useNFTRegistry } from "../../hooks/blockchain/useNFTRegistry";
import { usePBTRegistry } from "../../hooks/blockchain/usePBTRegistry";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { HaLoNFCChipSignatureOutput, useHaLoNFCChip } from "../../hooks/useHaloNFCChip";
import { encodeDataCarrierURL } from "../../lib/utils";
import { api } from "../../lib/web-api";
import {
  ArweaveURI,
  DIDPassportMetadata,
  NFTPassportMetadata,
  PBTPassportMetadata,
  PassportMetadata,
} from "../../types";
import InfoButton from "../ui/InfoButton";
import { Text } from "react-native";
import { useState } from "react";

const createDigitalIdentifier = async (
  createFn: (passportDataURI: ArweaveURI) => Promise<PassportMetadata>,
  state: CreationState,
  dispatch: (action: CreationAction) => void
) => {
  if (!state.results.passportDataURI) {
    dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport URI not available" });
    return;
  }
  const passportDataURI = state.results.passportDataURI;
  try {
    const passportMetadata = await createFn(passportDataURI);
    const passportMetadataURI = await api.arweave.uploadPassportMetadata(passportMetadata);

    if (!passportMetadataURI) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport metadata URI not available" });
      return;
    }
    const dataCarrierURL = encodeDataCarrierURL(passportMetadataURI);

    dispatch({ type: "RESULTS_CHANGED", dataCarrierURL });
    dispatch({ type: "CREATION_STATUS_CHANGED", status: "DIGITAL_IDENTIFIER_CREATED" });
  } catch (error) {
    dispatch({
      type: "CREATION_ERROR_OCCURRED",
      errorMessage: "An error occurred while creating digital identifier",
    });
  }
};

export const CreateNFTStep = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { state, dispatch } = useCreation();
  const { nftRegistry } = useNFTRegistry();
  const { openModal } = useModal();

  const createNFT = (passportDataURI: ArweaveURI) => {
    return new Promise<NFTPassportMetadata>((resolve, reject) => {
      openModal(
        <ConfirmModal
          title="Creating NFTs cost gas fees"
          content="Do you want to pay for the gas fees to mint the NFT with your wallet?"
          onConfirm={async () => {
            try {
              const passportMetadata = await nftRegistry.createNFT!(passportDataURI);
              resolve(passportMetadata);
            } catch (error) {
              reject(error);
              throw new Error("Failed to create NFT");
            }
          }}
          onReject={async () => {
            dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected gas fees" });
          }}
        />
      );
    });
  };

  useAsyncEffect(async () => {
    if (state.userInput.digitalIdentifier === "nft" && state.status === "PASSPORT_DATA_UPLOADED") {
      await createDigitalIdentifier(createNFT, state, dispatch);
    }
    if (state.userInput.digitalIdentifier === "nft" && state.status === "DIGITAL_IDENTIFIER_CREATED") {
      setIsCompleted(true);
    }
  }, [state.status, state.userInput.digitalIdentifier]);

  return {
    title: "Creating NFT as digital identifier",
    description: (
      <>
        An NFT will be minted on the{" "}
        <InfoButton
          title="Sepolia Blockchain"
          content="Sepolia is a decentralized blockchain network that enables the minting of NFTs. Currently, only Sepolia is supported."
        />{" "}
        and will permanently exist there.
      </>
    ),
    isLoading: state.userInput.digitalIdentifier === "nft" && state.status === "PASSPORT_DATA_UPLOADED",
    isCompleted,
  };
};

export const CreatePBTStep = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { state, dispatch } = useCreation();
  const { pbtRegistry } = usePBTRegistry();
  const { haloNFCChip } = useHaLoNFCChip();
  const { openModal } = useModal();

  const computeSignatureFromChip = () => {
    return new Promise<HaLoNFCChipSignatureOutput>((resolve, reject) => {
      openModal(
        <ConfirmModal
          title="Halo NFC chip signature"
          content={
            "Before a PBT can be minted, a signature from the HaLo NFC chip is required to map a chip on a blockchain. Click the button below and tap your smartphone on the HaLo NFC chip to obtain this signature."
          }
          onConfirm={async () => {
            try {
              const result = await haloNFCChip.computeSignatureFromChip!();
              if (!result) {
                throw new Error();
              }
              resolve(result);
            } catch (error) {
              reject(error);
              throw new Error("Failed to compute signature from chip");
            }
          }}
          onReject={async () => {
            dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected signature from chip" });
          }}
        />
      );
    });
  };

  const createPBT = async (passportDataURI: ArweaveURI, chipSignature: HaLoNFCChipSignatureOutput) => {
    return new Promise<PBTPassportMetadata>((resolve, reject) => {
      openModal(
        <ConfirmModal
          title="Creating PBT cost gas fees"
          content={"Do you want to pay for the gas fees to mint the PBT with your wallet?"}
          onConfirm={async () => {
            try {
              const passportMetadata = await pbtRegistry.createPBT!(
                chipSignature.chipAddress,
                chipSignature.signatureFromChip,
                chipSignature.blockNumberUsedInSig,
                passportDataURI
              );
              resolve(passportMetadata);
            } catch (error) {
              reject(error);
              throw new Error("Failed to create PBT");
            }
          }}
          onReject={async () => {
            dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected gas fees" });
          }}
        />
      );
    });
  };

  const handlePBTCreation = async (passportDataURI: ArweaveURI) => {
    const { chipAddress, signatureFromChip, blockNumberUsedInSig } = await computeSignatureFromChip();
    const passportMetadata = await createPBT(passportDataURI, {
      chipAddress,
      signatureFromChip,
      blockNumberUsedInSig,
    });
    return passportMetadata;
  };

  useAsyncEffect(async () => {
    if (state.userInput.digitalIdentifier === "pbt" && state.status === "PASSPORT_DATA_UPLOADED") {
      await createDigitalIdentifier(handlePBTCreation, state, dispatch);
    }
    if (state.userInput.digitalIdentifier === "pbt" && state.status === "DIGITAL_IDENTIFIER_CREATED") {
      setIsCompleted(true);
    }
  }, [state.status, state.userInput.digitalIdentifier]);

  return {
    title: "Creating PBT as digital identifier",
    description: (
      <>
        A PBT will be created on the{" "}
        <InfoButton
          title="Sepolia Blockchain"
          content="Sepolia is a decentralized blockchain network that enables the minting of PBTs. Currently, only Sepolia is supported."
        />{" "}
        and will permanently exist there.
      </>
    ),
    isLoading: state.userInput.digitalIdentifier === "pbt" && state.status === "PASSPORT_DATA_UPLOADED",
    isCompleted,
  };
};

export const CreateDIDStep = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { state, dispatch } = useCreation();
  const { didRegistry } = useDIDRegistry();
  const { openModal } = useModal();

  const createDID = async (passportDataURI: ArweaveURI) => {
    return new Promise<DIDPassportMetadata>((resolve, reject) => {
      openModal(
        <ConfirmModal
          title="Creating DID cost gas fees"
          content={"Do you want to pay for the gas fees to mint the DID with your wallet?"}
          onConfirm={async () => {
            try {
              const passportMetadata = await didRegistry.createDID!();
              await didRegistry.addDIDService!(passportMetadata.did, passportDataURI);
              resolve(passportMetadata);
            } catch (error) {
              reject(error);
              throw new Error("Failed to create DID");
            }
          }}
          onReject={async () => {
            dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected gas fees" });
          }}
        />
      );
    });
  };

  const addDIDService = async (passportMetadata: DIDPassportMetadata, passportDataURI: ArweaveURI) => {
    return new Promise<void>((resolve, reject) => {
      openModal(
        <ConfirmModal
          title="Adding DID service cost gas fees"
          content={"Do you want to pay for the gas fees to add the DID service with your wallet?"}
          onConfirm={async () => {
            try {
              await didRegistry.addDIDService!(passportMetadata.did, passportDataURI);
              resolve();
            } catch (error) {
              reject(error);
              throw new Error("Failed to add DID service");
            }
          }}
          onReject={async () => {
            dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "User rejected gas fees" });
          }}
        />
      );
    });
  };

  const handleDIDCreation = async (passportDataURI: ArweaveURI) => {
    const passportMetadata = await createDID(passportDataURI);
    await addDIDService(passportMetadata, passportDataURI);
    return passportMetadata;
  };

  useAsyncEffect(async () => {
    if (state.userInput.digitalIdentifier === "did" && state.status === "PASSPORT_DATA_UPLOADED") {
      await createDigitalIdentifier(handleDIDCreation, state, dispatch);
    }
    if (state.userInput.digitalIdentifier === "did" && state.status === "DIGITAL_IDENTIFIER_CREATED") {
      setIsCompleted(true);
    }
  }, [state.status, state.userInput.digitalIdentifier]);

  return {
    title: "Creating DID as digital identifier",
    description: (
      <>
        A DID will be created on the{" "}
        <InfoButton
          title="Sepolia Blockchain"
          content="Sepolia is a decentralized blockchain network that enables the creation of DIDs. Currently, only Sepolia is supported."
        />{" "}
        and will permanently exist there.
      </>
    ),
    isLoading: state.userInput.digitalIdentifier === "did" && state.status === "PASSPORT_DATA_UPLOADED",
    isCompleted,
  };
};
