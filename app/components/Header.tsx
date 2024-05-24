import { router } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import WalletConnector from "./WalletConnector";
import { commonColors } from "../styles";

interface HeaderProps {
  onBack?: () => void;
}

export default function Header({ onBack }: HeaderProps) {
  const canGoBack = router.canGoBack();
  const showBackButton = canGoBack || onBack;

  return (
    <View style={styles.container}>
      {showBackButton && (
        <Pressable onPress={onBack ? onBack : router.back} style={styles.backButton}>
          <ChevronLeftIcon height={24} strokeWidth={1.5} color={commonColors.black} />
        </Pressable>
      )}
      <View style={styles.walletConnector}>
        <WalletConnector />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    paddingRight: 24,
  },
  walletConnector: {
    flex: 1,
  },
});
