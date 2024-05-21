import ViewWithWalletConnector from "../components/ui/ViewWithWalletConnector";
import StepOption from "../components/stepper/StepOption";
import { router } from "expo-router";
import { commonColors } from "../styles";
import { PlusSquareIcon } from "../components/icons/PlusSquareIcon";
import StepTitle from "../components/stepper/StepTitle";
import StepSubtitle from "../components/stepper/StepSubtitle";
import { QRCodeIcon } from "../components/icons/QRCodeIcon";
import { NFCIcon } from "../components/icons/NFCIcon";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { execHaloCmdRN } from "@arx-research/libhalo/api/react-native.js";

NfcManager.start();

export default function Page() {
  const openCamera = async () => {
    // TODO open camera
    console.log("open camera");
  };

  const readNdef = async () => {
    await NfcManager.requestTechnology(NfcTech.IsoDep);

    console.log("Reading NDEF...");
    let ndef = await execHaloCmdRN(NfcManager, { name: "read_ndef" });
    console.log("read_ndef", JSON.stringify(ndef, null, 2));

    // TODO: read uri and open reading view
  };

  return (
    <ViewWithWalletConnector withScrollView>
      <StepTitle text="Welcome to PermaPass" highlight="PermaPass" />
      <StepSubtitle text="PermaPass is a decentralized identity and passport system for construction products." />
      <StepOption
        title="Create Passport"
        subtitle="Choose between QR Codes or HaLo NFC chips acting as data carrier and NFTs, PBTs or DIDs to represent digital identity."
        onPress={() => router.push("/create/01-set-passport-data")}
        Icon={<PlusSquareIcon height={48} strokeWidth={1.1} color={commonColors.black} />}
      />
      <StepSubtitle text="Or scan a passport to view its data. You can either directly scan a QR Code or read a HaLo NFC chip or do it from the app as follows." />
      <StepOption
        title="Read QR Code Passport"
        subtitle="Open the camera and scan a QR code based passport."
        onPress={openCamera}
        Icon={<QRCodeIcon height={48} strokeWidth={1.1} color={commonColors.black} />}
      />
      <StepOption
        title="Read HaLo NFC Passport"
        subtitle="Open the NFC reader and scan a HaLo NFC based passport."
        onPress={readNdef}
        Icon={<NFCIcon height={48} strokeWidth={1.1} color={commonColors.black} />}
      />
    </ViewWithWalletConnector>
  );
}
