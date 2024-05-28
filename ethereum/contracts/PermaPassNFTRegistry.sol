// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

error NotTokenOwner();

/**
 * @dev This contract manages NFTs for PermaPass. It additionally maintains a change history mapping to
 * track modifications, similar to the PermaPassDIDRegistry contract.
 */
contract PermaPassNFTRegistry is ERC721URIStorage {
	uint256 private _nextTokenId;
	mapping(uint256 => uint256) public changed;

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

	function safeMint(address to, string memory uri) external {
		uint256 tokenId = _nextTokenId++;
		_safeMint(to, tokenId);
		setTokenURI(tokenId, uri);
	}

	function setTokenURI(
		uint256 tokenId,
		string memory uri
	) public onlyTokenOwner(tokenId) {
		_setTokenURI(tokenId, uri);
		emit TokenURIChanged(tokenId, msg.sender, uri, changed[tokenId]);
		changed[tokenId] = block.number;
	}

	function exists(uint256 tokenId) public view returns (bool) {
		return _exists(tokenId);
	}

	function burn(uint256 tokenId) external onlyTokenOwner(tokenId) {
		_burn(tokenId);
	}
}
