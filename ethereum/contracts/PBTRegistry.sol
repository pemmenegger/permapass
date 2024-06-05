// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PBTSimple} from "@chiru-labs/pbt/src/PBTSimple.sol";

error AlreadyMinted();
error NotTokenOwner();

/**
 * @dev This contract manages PBTs for PermaPass. It additionally maintains a change history mapping to
 * track modifications, similar to the DIDRegistry contract.
 */
contract PBTRegistry is PBTSimple {
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _nextTokenId;
    mapping(uint256 => uint256) public changed;

    event TokenURIChanged(
        uint256 indexed tokenId,
        address sender,
        string uri,
        uint256 previousChange
    );

    modifier onlyTokenOwner(uint256 tokenId) {
        if (ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner();
        }
        _;
    }

    constructor() PBTSimple("PBTRegistry", "PPPBT") {}

    /**
     * @dev This function is used to mint a PBT with a chip.
     * First, the chip must be seeded to the token mapping.
     * Then, the PBT will be minted with the chip.
     * Finally, the metadataURI will be stored for data retrieval.
     */
    function mintPBT(
        address chipAddress,
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig,
        string memory _tokenURI
    ) external {
        // Revert if the chip has already been seeded and minted
        if (_tokenDatas[chipAddress].set) {
            revert AlreadyMinted();
        }

        // get next token ID
        uint256 tokenId = ++_nextTokenId;

        // seed chip to token mapping, i.e. register chip
        address[] memory chipAddresses = new address[](1);
        uint256[] memory tokenIds = new uint256[](1);
        chipAddresses[0] = chipAddress;
        tokenIds[0] = tokenId;
        _seedChipToTokenMapping(chipAddresses, tokenIds);

        // mint token with chip, i.e. mint PBT
        _mintTokenWithChip(signatureFromChip, blockNumberUsedInSig);

        // set token URI
        setTokenURI(tokenId, _tokenURI);
    }

    /**
     * @dev Similar to the NFTRegistry contract,
     * this function is used to set the metadata URI for a chip.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _exists(tokenId),
            "PBTRegistry: URI query for nonexistent token"
        );
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Similar to the NFTRegistry contract,
     * this function is used to set the token URI for a chip
     * and track the change history.
     */
    function setTokenURI(
        uint256 tokenId,
        string memory _tokenURI
    ) public onlyTokenOwner(tokenId) {
        require(_exists(tokenId), "PBTRegistry: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
        emit TokenURIChanged(tokenId, msg.sender, _tokenURI, changed[tokenId]);
        changed[tokenId] = block.number;
    }

    /**
     * @dev This function checks if a token exists.
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    /**
     * @dev This function "deletes" a token by burning it.
     */
    function burn(uint256 tokenId) external onlyTokenOwner(tokenId) {
        _burn(tokenId);
    }
}
