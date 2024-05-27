import React from "react";
import { usePassportMetadata } from "../hooks/usePassportMetadata";
import { useMetadataURIFromParams } from "../hooks/useMetadataURIFromParams";
import ViewWithHeader from "../components/ViewWithHeader";
import StepTitle from "../components/stepper/StepTitle";
import PassportWithHistory from "../components/PassportWithHistory";
import PassportMetadata from "../components/PassportMetadata";
import { goToHome } from "../lib/utils";
import { Text } from "react-native";

export default function Page() {
  const { metadataURI, error: metadataURIError } = useMetadataURIFromParams();
  const { passportMetadata, isLoading, error: metadataError } = usePassportMetadata({ metadataURI });

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
      {passportMetadata && <PassportWithHistory passportMetadata={passportMetadata} />}
    </ViewWithHeader>
  );
}
