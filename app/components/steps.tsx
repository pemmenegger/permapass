import { useCreation } from "../context/CreationContext";
import InfoButton from "./ui/InfoButton";

export const UploadPassportDataStep = () => {
  const { state } = useCreation();

  return {
    title: "Uploading passport data",
    description: (
      <>
        Passport data will be uploaded to{" "}
        <InfoButton
          label="Arweave"
          description="Arweave is a decentralized storage network that enables permanent storage of data."
        />
        , where it will be permanently stored.
      </>
    ),
    isLoading: state.status === "CREATION_STARTED",
    isCompleted: state.status === "PASSPORT_DATA_UPLOADED",
  };
};

export const CreateNFTStep = () => {
  const { state } = useCreation();

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
  const { state } = useCreation();

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
  const { state } = useCreation();

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

export const GenerateQRCodeStep = () => {
  const { state } = useCreation();

  return {
    title: "Generating QR Code as data carrier",
    description: <>A QR Code linking to the digital identifier and passport data will be generated.</>,
    isLoading: state.userInput.dataCarrier === "qr" && state.status === "DIGITAL_IDENTIFIER_CREATED",
    isCompleted: state.status === "QR_CODE_GENERATED",
  };
};

export const WriteHaLoChipStep = () => {
  const { state } = useCreation();

  return {
    title: "Writing to HaLo NFC Chip",
    description: <>The passport data will be written to the HaLo NFC chip.</>,
    isLoading: state.userInput.dataCarrier === "nfc" && state.status === "QR_CODE_GENERATED",
    isCompleted: state.status === "HALO_NFC_WRITTEN",
  };
};
