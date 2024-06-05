import { useDIDRegistry } from "./useDIDRegistry";
import { useHaLoNFCMetadataRegistry } from "./useHaLoNFCMetadataRegistry";
import { useNFTRegistry } from "./useNFTRegistry";
import { usePBTRegistry } from "./usePBTRegistry";

export function useContracts() {
  const { didRegistry } = useDIDRegistry();
  const { nftRegistry } = useNFTRegistry();
  const { pbtRegistry } = usePBTRegistry();
  const { haLoNFCMetadataRegistry } = useHaLoNFCMetadataRegistry();

  return {
    didRegistry,
    nftRegistry,
    pbtRegistry,
    haLoNFCMetadataRegistry,
  };
}
