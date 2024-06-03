// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PBTSimple} from "@chiru-labs/pbt/src/PBTSimple.sol";

error AlreadyMinted();

contract PermaPassPBTRegistry is PBTSimple {
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _nextTokenId;
    mapping(uint256 => uint256) public changed;

    event TokenURIChanged(
        uint256 indexed tokenId,
        address sender,
        string uri,
        uint256 previousChange
    );

    constructor() PBTSimple("PermaPassPBTRegistry", "PPPBT") {}

    function mintPBT(
        address chipAddress,
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig,
        string memory _tokenURI
    ) external {
        // The chip address needs to be seeded into the contract as an allowlist for which chips can mint and transfer
        if (_tokenDatas[chipAddress].set) {
            revert AlreadyMinted();
        }
        uint256 tokenId = _nextTokenId++;

        address[] memory chipAddresses = new address[](1);
        uint256[] memory tokenIds = new uint256[](1);
        chipAddresses[0] = chipAddress;
        tokenIds[0] = tokenId;
        _seedChipToTokenMapping(chipAddresses, tokenIds);

        // mint token with chip
        _mintTokenWithChip(signatureFromChip, blockNumberUsedInSig);

        // set token URI
        setTokenURI(tokenId, _tokenURI);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _exists(tokenId),
            "PermaPassPBTRegistry: URI query for nonexistent token"
        );
        return _tokenURIs[tokenId];
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(
            _exists(tokenId),
            "PermaPassPBTRegistry: URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = _tokenURI;
        emit TokenURIChanged(tokenId, msg.sender, _tokenURI, changed[tokenId]);
        changed[tokenId] = block.number;
    }
}
