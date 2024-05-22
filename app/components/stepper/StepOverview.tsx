import { View, Text, StyleSheet } from "react-native";
import { commonColors, commonStyles } from "../../styles";
import { LoadingSpinnerIcon } from "../icons/LoadingSpinnerIcon";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import React from "react";
import InfoButton from "../ui/InfoButton";

interface StepProps {
  title: string;
  description: React.ReactNode;
  isLoading: boolean;
  isCompleted: boolean;
}

interface StepOverviewProps {
  steps: StepProps[];
}

const allSteps = {
  uploadData: {
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
  },
  nft: {
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
  },
  pbt: {
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
  },
  qr: {
    title: "Generating QR Code as data carrier",
    description: <>A QR Code linking to the digital identifier and passport data will be generated.</>,
  },
  nfc: {
    title: "Setting up HaLo NFC Chip as data carrier",
    description: (
      <>
        The HaLo NFC Chip will be programmed with the digital identifier that links to the passport data. This chip can
        be scanned by any NFC-enabled device to access the passport data.
      </>
    ),
  },
};

export default function StepOverview({ steps }: StepOverviewProps) {
  return (
    <View style={styles.steps}>
      {steps.map((step, index) => (
        <View style={styles.step} key={index}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.stepText}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {step.isLoading && (
                <View style={{ marginRight: 8 }}>
                  <LoadingSpinnerIcon height={16} color={commonColors.gray} strokeWidth={2.3} />
                </View>
              )}
              {step.isCompleted && (
                <View style={{ marginRight: 8 }}>
                  <CheckCircleIcon height={16} color={commonColors.primary} strokeWidth={2} />
                </View>
              )}
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  steps: {
    marginTop: 24,
  },
  step: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: commonColors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  stepNumberText: {
    ...commonStyles.p,
    fontFamily: "Inter-SemiBold",
  },
  stepText: {
    marginTop: 4,
    marginLeft: 16,
    flex: 1,
  },
  stepTitle: {
    ...commonStyles.p,
    fontFamily: "Inter-SemiBold",
  },
  stepDescription: {
    ...commonStyles.h4,
    marginTop: 4,
  },
});
