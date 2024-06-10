import { router } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import WalletConnector from "./WalletConnector";
import { commonColors } from "../styles";

interface HeaderProps {
  onBack?: () => void;
  disableBackButton?: boolean;
}

export default function Header({ onBack, disableBackButton = false }: HeaderProps) {
  const canNavigateBack = router.canGoBack();
  const shouldShowBackButton = canNavigateBack || onBack;

  return (
    <View style={styles.headerContainer}>
      {!disableBackButton && shouldShowBackButton && (
        <Pressable onPress={onBack ? onBack : router.back} style={styles.backButton}>
          <ChevronLeftIcon height={24} strokeWidth={1.5} color={commonColors.black} />
        </Pressable>
      )}
      <View style={styles.walletConnectorContainer}>
        <WalletConnector />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    paddingRight: 24,
  },
  walletConnectorContainer: {
    flex: 1,
  },
});
