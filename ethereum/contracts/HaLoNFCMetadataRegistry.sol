// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// extension: allows for storing metadata URIs for HaLo NFC chips
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

error InvalidBlockNumber();
error BlockNumberTooOld();
error AlreadySet();
error InvalidSignature();

/**
 * @dev This contract allows for storing metadata URIs for HaLo NFC chips
 * since the NDEF is not writable due to security reasons.
 */
contract HaLoNFCMetadataRegistry {
    using ECDSA for bytes32;
    mapping(address => string) public metadataURIs;

    /**
     * @dev This function is used to set the metadata URI for a HaLo NFC chip.
     * The verification process of the HaLo Chip was copied from the PBTSimple contract
     *
     * Since the HaLo chip NDEF is not writable due to security reasons,
     * reading the metadataURI will be done on-chain.
     */
    function initMetadataURI(
        address chipAddress,
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig,
        string memory metadataURI
    ) external {
        // Revert if the metadataURI has already been set
        if (bytes(metadataURIs[chipAddress]).length > 0) {
            revert AlreadySet();
        }

        // The blockNumberUsedInSig must be in a previous block because the blockhash of the current
        // block does not exist yet.
        if (block.number <= blockNumberUsedInSig) {
            revert InvalidBlockNumber();
        }

        unchecked {
            if (block.number - blockNumberUsedInSig > 100) {
                revert BlockNumberTooOld();
            }
        }

        bytes32 blockHash = blockhash(blockNumberUsedInSig);
        bytes32 signedHash = keccak256(abi.encodePacked(msg.sender, blockHash))
            .toEthSignedMessageHash();
        address chipAddr = signedHash.recover(signatureFromChip);

        // Revert if the chip addresses does not match
        if (chipAddr != chipAddress) {
            revert InvalidSignature();
        }

        metadataURIs[chipAddr] = metadataURI;
    }
}
