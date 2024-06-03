import { useCreation } from "../../context/CreationContext";
import { useEffect, useState } from "react";

export const GenerateQRCodeStep = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { state, dispatch } = useCreation();

  const generateQRCode = () => {
    dispatch({ type: "CREATION_STATUS_CHANGED", status: "CREATION_DONE" });
  };

  useEffect(() => {
    if (state.status === "DIGITAL_IDENTIFIER_CREATED") {
      generateQRCode();
    }
    if (state.status === "CREATION_DONE") {
      setIsCompleted(true);
    }
  }, [state.status, state.userInput.dataCarrier]);

  return {
    title: "Generating QR Code as data carrier",
    description: <>A QR Code linking to the digital identifier and passport data will be generated.</>,
    isLoading: state.status === "DIGITAL_IDENTIFIER_CREATED",
    isCompleted,
  };
};

export const WriteHaLoChipStep = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { state, dispatch } = useCreation();

  const writeHaLoNFCChip = () => {
    const urlToEncode = state.results.dataCarrierURL!;

    // TODO write to HaLo NFC chip

    dispatch({ type: "CREATION_STATUS_CHANGED", status: "CREATION_DONE" });
  };

  useEffect(() => {
    if (state.status === "DIGITAL_IDENTIFIER_CREATED") {
      writeHaLoNFCChip();
    }
    if (state.status === "CREATION_DONE") {
      setIsCompleted(true);
    }
  }, [state.status, state.userInput.dataCarrier]);

  return {
    title: "Writing to HaLo NFC Chip",
    description: <>The passport data will be written to the HaLo NFC chip.</>,
    isLoading: state.status === "DIGITAL_IDENTIFIER_CREATED",
    isCompleted,
  };
};
