// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

error NotTokenOwner();

/**
 * @dev This contract manages NFTs for PermaPass. It additionally maintains a change history mapping to
 * track modifications, similar to the PermaPassDIDRegistry contract.
 */
contract PermaPassNFTRegistry is ERC721URIStorage {
    uint256 private _nextTokenId;
    mapping(uint256 => uint256) public changed;

    /**
     * @dev Emitted when a new NFT is minted.
     */
    event Minted(address indexed to, string indexed uri, uint256 tokenId);

    /**
     * @dev Emitted when `tokenURI` is updated.
     */
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

    constructor() ERC721("PermaPassNFTRegistry", "PPNFT") {}

    /**
     * @dev This function mints an NFT with the given first owner and token URI.
     */
    function mintNFT(address to, string memory uri) external {
        // get next token ID
        uint256 tokenId = ++_nextTokenId;

        // mint token
        _safeMint(to, tokenId);
        emit Minted(to, uri, tokenId);

        // set token URI
        setTokenURI(tokenId, uri);
    }

    /**
     * @dev This function updates the token URI and
     * tracks the change in the `changed` mapping.
     */
    function setTokenURI(
        uint256 tokenId,
        string memory uri
    ) public onlyTokenOwner(tokenId) {
        _setTokenURI(tokenId, uri);
        emit TokenURIChanged(tokenId, msg.sender, uri, changed[tokenId]);
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
