import InfoButton from "./ui/InfoButton";

export const UploadPassportDataStep = ({ isLoading, isCompleted }: { isLoading: boolean; isCompleted: boolean }) => {
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
    isLoading,
    isCompleted,
  };
};

export const CreateNFTStep = ({ isLoading, isCompleted }: { isLoading: boolean; isCompleted: boolean }) => {
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
    isLoading,
    isCompleted,
  };
};

export const CreatePBTStep = ({ isLoading, isCompleted }: { isLoading: boolean; isCompleted: boolean }) => {
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
    isLoading,
    isCompleted,
  };
};

export const GenerateQRCodeStep = ({ isLoading, isCompleted }: { isLoading: boolean; isCompleted: boolean }) => {
  return {
    title: "Generating QR Code as data carrier",
    description: <>A QR Code linking to the digital identifier and passport data will be generated.</>,
    isLoading,
    isCompleted,
  };
};

export const WriteHaLoChipStep = ({ isLoading, isCompleted }: { isLoading: boolean; isCompleted: boolean }) => {
  return {
    title: "Writing to HaLo NFC Chip",
    description: <>The passport data will be written to the HaLo NFC chip.</>,
    isLoading,
    isCompleted,
  };
};
