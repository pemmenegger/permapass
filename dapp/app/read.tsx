import React from "react";
import { usePassportMetadata } from "../hooks/usePassportMetadata";
import { useMetadataURIFromParams } from "../hooks/useMetadataURIFromParams";
import ViewWithHeader from "../components/ViewWithHeader";
import StepTitle from "../components/stepper/StepTitle";
import PassportRead from "../components/PassportRead";
import PassportMetadata from "../components/PassportMetadata";
import { goToHome } from "../lib/utils";
import { Text } from "react-native";
import LoadingText from "../components/LoadingText";

export default function Page() {
  const { metadataURI, isLoading: isLoadingMetadataURI, error: metadataURIError } = useMetadataURIFromParams();
  const { passportMetadata, isLoading, error: metadataError } = usePassportMetadata({ metadataURI });

  if (isLoadingMetadataURI) {
    return (
      <ViewWithHeader onBack={goToHome}>
        <LoadingText text="Parsing metadata URI..." isLoading={isLoadingMetadataURI} />
      </ViewWithHeader>
    );
  }

  if (metadataURIError) {
    return (
      <ViewWithHeader onBack={goToHome}>
        <Text>An error occurred while loading the passport.</Text>
      </ViewWithHeader>
    );
  }

  return (
    <ViewWithHeader onBack={goToHome} withScrollView>
      {passportMetadata && (
        <StepTitle
          text={`You have read a ${passportMetadata.type.toUpperCase()}-based passport.`}
          highlight={`${passportMetadata.type.toUpperCase()}-based`}
        />
      )}
      {metadataURI && <PassportMetadata isLoading={isLoading} error={metadataError} metadata={passportMetadata} />}
      {passportMetadata && <PassportRead passportMetadata={passportMetadata} />}
    </ViewWithHeader>
  );
}
