import { Text, View } from "react-native";
import { usePassport } from "../lib/hooks/usePassport";
import { useReadQueryParams } from "../lib/hooks/useReadQueryParams";

export default function Page() {
  const { passportType, arweaveTxid } = useReadQueryParams();
  const { passport, isLoading, error } = usePassport({ passportType, arweaveTxid });

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Passport: {JSON.stringify(passport)}</Text>
    </View>
  );
}
