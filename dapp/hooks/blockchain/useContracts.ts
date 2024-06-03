import { useDIDRegistry } from "./useDIDRegistry";
import { useNFTRegistry } from "./useNFTRegistry";
import { usePBTRegistry } from "./usePBTRegistry";

export function useContracts() {
  const { didRegistry } = useDIDRegistry();
  const { nftRegistry } = useNFTRegistry();
  const { pbtRegistry } = usePBTRegistry();

  return {
    didRegistry,
    nftRegistry,
    pbtRegistry,
  };
}
