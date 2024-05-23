import { useCreation } from "../../context/CreationContext";
import { CreationAction, CreationState } from "../../context/CreationContext/reducer";
import { useModal } from "../../context/InfoModalContext";
import { OpenWalletModal } from "../../context/InfoModalContext/modals";
import { useDIDRegistry } from "../../hooks/blockchain/useDIDRegistry";
import { useNFTRegistry } from "../../hooks/blockchain/useNFTRegistry";
import { usePBTRegistry } from "../../hooks/blockchain/usePBTRegistry";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useHaLoNFCChip } from "../../hooks/useHaloNFCChip";
import { encodeDataCarrierURL } from "../../lib/utils";
import { api } from "../../lib/web-api";
import { ArweaveURI, PassportMetadata } from "../../types";
import InfoButton from "../ui/InfoButton";
import { Text } from "react-native";

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
  const { state, dispatch } = useCreation();
  const { nftRegistry } = useNFTRegistry();
  const { openModal } = useModal();

  const createNFT = (passportDataURI: ArweaveURI) => {
    return new Promise<PassportMetadata>((resolve, reject) => {
      openModal(
        <OpenWalletModal
          title="Creating NFTs cost gas fees"
          description={<Text>Do you want to pay for the gas fees to mint the NFT with your wallet?</Text>}
          onConfirm={async () => {
            try {
              console.log("Opening wallet modal");
              const passportMetadata = await nftRegistry.createNFT!(passportDataURI);
              console.log("NFT created");
              resolve(passportMetadata);
            } catch (error) {
              reject(error);
              throw new Error("Failed to create NFT");
            }
          }}
        />
      );
    });
  };

  useAsyncEffect(async () => {
    if (state.status === "PASSPORT_DATA_UPLOADED" && state.userInput.digitalIdentifier === "nft") {
      await createDigitalIdentifier(createNFT, state, dispatch);
    }
  }, [state.status, state.userInput.digitalIdentifier]);

  return {
    title: "Creating NFT as digital identifier",
    description: (
      <>
        An NFT will be minted on the{" "}
        <InfoButton
          label="Sepolia Blockchain"
          description="Sepolia is a decentralized blockchain network that enables the minting of NFTs. Currently, only Sepolia is supported."
        />{" "}
        and will permanently exist there.
      </>
    ),
    isLoading: state.userInput.digitalIdentifier === "nft" && state.status === "PASSPORT_DATA_UPLOADED",
    isCompleted: state.userInput.digitalIdentifier === "nft" && state.status === "DIGITAL_IDENTIFIER_CREATED",
  };
};

export const CreatePBTStep = () => {
  const { state, dispatch } = useCreation();
  const { pbtRegistry } = usePBTRegistry();
  const { haloNFCChip } = useHaLoNFCChip();

  const createPBT = async (passportDataURI: ArweaveURI) => {
    // TODO prompt use to pay for gas fees (modal)
    const result = await haloNFCChip.computeSignatureFromChip!();
    if (!result) {
      throw new Error("Failed to compute signature from chip");
    }
    const { chipAddress, signatureFromChip, blockNumberUsedInSig } = result;
    // TODO prompt use to pay for gas fees (modal)
    const passportMetadata = await pbtRegistry.createPBT!(
      chipAddress,
      signatureFromChip,
      blockNumberUsedInSig,
      passportDataURI
    );
    return passportMetadata;
  };

  useAsyncEffect(async () => {
    if (state.status === "PASSPORT_DATA_UPLOADED" && state.userInput.digitalIdentifier === "pbt") {
      await createDigitalIdentifier(createPBT, state, dispatch);
    }
  }, [state.status, state.userInput.digitalIdentifier]);

  return {
    title: "Creating PBT as digital identifier",
    description: (
      <>
        A PBT will be created on the{" "}
        <InfoButton
          label="Sepolia Blockchain"
          description="Sepolia is a decentralized blockchain network that enables the minting of PBTs. Currently, only Sepolia is supported."
        />{" "}
        and will permanently exist there.
      </>
    ),
    isLoading: state.userInput.digitalIdentifier === "pbt" && state.status === "PASSPORT_DATA_UPLOADED",
    isCompleted: state.userInput.digitalIdentifier === "pbt" && state.status === "DIGITAL_IDENTIFIER_CREATED",
  };
};

export const CreateDIDStep = () => {
  const { state, dispatch } = useCreation();
  const { didRegistry } = useDIDRegistry();

  const createDID = async (passportDataURI: ArweaveURI) => {
    // TODO prompt use to pay for gas fees (modal)
    const passportMetadata = await didRegistry.createDID!();
    // TODO prompt use to pay for gas fees (modal)
    await didRegistry.addDIDService!(passportMetadata.did, passportDataURI);
    return passportMetadata;
  };

  useAsyncEffect(async () => {
    if (state.status === "PASSPORT_DATA_UPLOADED" && state.userInput.digitalIdentifier === "did") {
      await createDigitalIdentifier(createDID, state, dispatch);
    }
  }, [state.status, state.userInput.digitalIdentifier]);

  return {
    title: "Creating DID as digital identifier",
    description: (
      <>
        A DID will be created on the{" "}
        <InfoButton
          label="Sepolia Blockchain"
          description="Sepolia is a decentralized blockchain network that enables the creation of DIDs. Currently, only Sepolia is supported."
        />{" "}
        and will permanently exist there.
      </>
    ),
    isLoading: state.userInput.digitalIdentifier === "did" && state.status === "PASSPORT_DATA_UPLOADED",
    isCompleted: state.userInput.digitalIdentifier === "did" && state.status === "DIGITAL_IDENTIFIER_CREATED",
  };
};
