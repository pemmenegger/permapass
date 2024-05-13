import * as Linking from "expo-linking";
import { PassportType } from "../types";

export function useReadQueryParams() {
  const url = Linking.useURL();
  const queryParams = url ? Linking.parse(url).queryParams : {};
  const passportType =
    typeof queryParams?.passportType === "string" ? (queryParams.passportType as PassportType) : undefined;
  const arweaveTxid = typeof queryParams?.arweaveTxid === "string" ? queryParams.arweaveTxid : undefined;

  return { passportType, arweaveTxid };
}
