import { router } from "expo-router";
import { useCreation } from "../../context/CreationContext";
import { useEffect } from "react";

export const GenerateQRCodeStep = () => {
  const { state, dispatch } = useCreation();

  const generateQRCode = () => {
    dispatch({ type: "CREATION_STATUS_CHANGED", status: "QR_CODE_GENERATED" });
    router.push({
      pathname: "/create/05-success",
      params: { qrCodeURL: state.results.dataCarrierURL! },
    });
  };

  useEffect(() => {
    if (state.userInput.dataCarrier === "qr" && state.status === "DIGITAL_IDENTIFIER_CREATED") {
      generateQRCode();
    }
  }, [state.status]);

  return {
    title: "Generating QR Code as data carrier",
    description: <>A QR Code linking to the digital identifier and passport data will be generated.</>,
    isLoading: state.userInput.dataCarrier === "qr" && state.status === "DIGITAL_IDENTIFIER_CREATED",
    isCompleted: state.status === "QR_CODE_GENERATED",
  };
};

export const WriteHaLoChipStep = () => {
  const { state, dispatch } = useCreation();

  const writeHaLoNFCChip = () => {
    const urlToEncode = state.results.dataCarrierURL!;
    // Write to HaLo NFC chip
    dispatch({ type: "CREATION_STATUS_CHANGED", status: "HALO_NFC_WRITTEN" });
  };

  useEffect(() => {
    if (state.userInput.dataCarrier === "nfc" && state.status === "QR_CODE_GENERATED") {
      writeHaLoNFCChip();
    }
  }, [state.status]);

  return {
    title: "Writing to HaLo NFC Chip",
    description: <>The passport data will be written to the HaLo NFC chip.</>,
    isLoading: state.userInput.dataCarrier === "nfc" && state.status === "QR_CODE_GENERATED",
    isCompleted: state.status === "HALO_NFC_WRITTEN",
  };
};
