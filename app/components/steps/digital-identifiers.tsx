import { useCreation } from "../../context/CreationContext";
import { useDIDRegistry } from "../../hooks/blockchain/useDIDRegistry";
import { useNFTRegistry } from "../../hooks/blockchain/useNFTRegistry";
import { usePBTRegistry } from "../../hooks/blockchain/usePBTRegistry";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useHaLoNFCChip } from "../../hooks/useHaloNFCChip";
import { encodeDataCarrierURL } from "../../lib/utils";
import { api } from "../../lib/web-api";
import InfoButton from "../ui/InfoButton";

export const CreateNFTStep = () => {
  const { state, dispatch } = useCreation();
  const { nftRegistry } = useNFTRegistry();

  const createNFT = async () => {
    if (!state.results.passportDataURI) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport URI not available" });
      return;
    }
    const passportDataURI = state.results.passportDataURI;

    const passportMetadata = await nftRegistry.createNFT!(passportDataURI);
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
    if (state.status === "PASSPORT_DATA_UPLOADED" && state.userInput.digitalIdentifier === "nft") {
      await createNFT();
    }
  }, [state.status]);

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

  const createPBT = async () => {
    if (!state.results.passportDataURI) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport URI not available" });
      return;
    }
    const passportDataURI = state.results.passportDataURI;

    const result = await haloNFCChip.computeSignatureFromChip!();
    if (!result) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Failed to compute signature from chip" });
      return;
    }
    const { chipAddress, signatureFromChip, blockNumberUsedInSig } = result;

    const passportMetadata = await pbtRegistry.createPBT!(
      chipAddress,
      signatureFromChip,
      blockNumberUsedInSig,
      passportDataURI
    );

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
    if (state.status === "PASSPORT_DATA_UPLOADED" && state.userInput.digitalIdentifier === "pbt") {
      await createPBT();
    }
  }, [state.status]);

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

  const createDID = async () => {
    if (!state.results.passportDataURI) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport URI not available" });
      return;
    }
    const passportDataURI = state.results.passportDataURI;

    const passportMetadata = await didRegistry.createDID!();
    await didRegistry.addDIDService!(passportMetadata.did, passportDataURI);
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
    if (state.status === "PASSPORT_DATA_UPLOADED" && state.userInput.digitalIdentifier === "did") {
      await createDID();
    }
  }, [state.status]);

  return {
    title: "Creating DID as digital identifier",
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
    isLoading: state.userInput.digitalIdentifier === "did" && state.status === "PASSPORT_DATA_UPLOADED",
    isCompleted: state.userInput.digitalIdentifier === "did" && state.status === "DIGITAL_IDENTIFIER_CREATED",
  };
};
