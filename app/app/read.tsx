import React from "react";
import { usePassportMetadata } from "../hooks/usePassportMetadata";
import { useReadQueryParams } from "../hooks/useReadQueryParams";
import ViewWithHeader from "../components/ViewWithHeader";
import StepTitle from "../components/stepper/StepTitle";
import PassportWithHistory from "../components/PassportWithHistory";
import PassportMetadata from "../components/PassportMetadata";
import { goToHome } from "../lib/utils";

export default function Page() {
  const { metadataURI } = useReadQueryParams();
  const { passportMetadata, isLoading: isMetadataLoading, error: metadataError } = usePassportMetadata({ metadataURI });

  return (
    <ViewWithHeader onBack={goToHome} withScrollView>
      {passportMetadata && (
        <StepTitle
          text={`You have read a ${passportMetadata.type.toUpperCase()}-based passport.`}
          highlight={`${passportMetadata.type.toUpperCase()}-based`}
        />
      )}
      {metadataURI && (
        <PassportMetadata isLoading={isMetadataLoading} error={metadataError} metadata={passportMetadata} />
      )}
      {passportMetadata && <PassportWithHistory passportMetadata={passportMetadata} />}
    </ViewWithHeader>
  );
}
