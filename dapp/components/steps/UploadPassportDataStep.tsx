import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { api } from "../../lib/web-api";
import InfoText from "../ui/InfoText";

export const UploadPassportDataStep = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { state, dispatch } = useCreation();

  const uploadPassportData = async () => {
    try {
      const passportDataURI = await api.arweave.uploadPassport(state.userInput.passportData!);
      dispatch({ type: "PASSPORT_DATA_UPLOADED", passportDataURI });
    } catch (error) {
      dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "An error occurred while uploading passport data" });
    }
  };

  useAsyncEffect(async () => {
    if (state.status === "CREATION_STARTED") {
      await uploadPassportData();
    }
    if (state.status === "PASSPORT_DATA_UPLOADED") {
      setIsCompleted(true);
    }
  }, [state.status]);

  return {
    title: "Uploading passport data",
    description: (
      <>
        Passport data will be uploaded to{" "}
        <InfoText
          title="Arweave"
          content="Arweave is a decentralized storage network that enables permanent storage of data."
        />
        , where it will be permanently stored.
      </>
    ),
    isLoading: state.status === "CREATION_STARTED",
    isCompleted,
  };
};
