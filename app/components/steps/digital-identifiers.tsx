import { Address } from "viem";
import { useCreation } from "../../context/CreationContext";
import { CreationAction, CreationState } from "../../context/CreationContext/reducer";
import { useModal } from "../../context/InfoModalContext";
import { OpenWalletModal } from "../../context/InfoModalContext/modals";
import { useDIDRegistry } from "../../hooks/blockchain/useDIDRegistry";
import { useNFTRegistry } from "../../hooks/blockchain/useNFTRegistry";
import { usePBTRegistry } from "../../hooks/blockchain/usePBTRegistry";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { HaLoNFCChipSignatureOutput, useHaLoNFCChip } from "../../hooks/useHaloNFCChip";
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
              const passportMetadata = await nftRegistry.createNFT!(passportDataURI);
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
  const { openModal } = useModal();

  const computeSignatureFromChip = () => {
    return new Promise<HaLoNFCChipSignatureOutput>((resolve, reject) => {
      openModal(
        <OpenWalletModal
          title="Halo NFC chip signature"
          description={
            <Text>
              Before a PBT can be minted, a signature from the HaLo NFC chip is required to map a chip on a blockchain.
              Click the button below and tap your smartphone on the HaLo NFC chip to obtain this signature.
            </Text>
          }
          onConfirm={async () => {
            try {
              console.log("Computing signature from chip");
              // const result: HaLoNFCChipSignatureOutput = {
              //   chipAddress: "0x123",
              //   signatureFromChip: "0x456",
              //   blockNumberUsedInSig: 123n,
              // };
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
        />
      );
    });
  };

  const createPBT = async (passportDataURI: ArweaveURI, chipSignature: HaLoNFCChipSignatureOutput) => {
    return new Promise<PassportMetadata>((resolve, reject) => {
      openModal(
        <OpenWalletModal
          title="Creating PBT cost gas fees"
          description={<Text>Do you want to pay for the gas fees to mint the PBT with your wallet?</Text>}
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
    if (state.status === "PASSPORT_DATA_UPLOADED" && state.userInput.digitalIdentifier === "pbt") {
      await createDigitalIdentifier(handlePBTCreation, state, dispatch);
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
