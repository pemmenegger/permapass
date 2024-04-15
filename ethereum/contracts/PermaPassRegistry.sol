// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PermaPassRegistry is
	ERC721,
	ERC721URIStorage,
	ERC721Burnable,
	Ownable
{
	uint256 private _nextTokenId;

	event Mint(address indexed to, string indexed uri, uint256 tokenId);

	constructor(
		address initialOwner
	) ERC721("PermaPassRegistry", "PPR") Ownable(initialOwner) {}

	function safeMint(address to, string memory uri) external {
		uint256 tokenId = _nextTokenId++;
		_safeMint(to, tokenId);
		_setTokenURI(tokenId, uri);
		emit Mint(to, uri, tokenId);
	}

	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	function supportsInterface(
		bytes4 interfaceId
	) public view override(ERC721, ERC721URIStorage) returns (bool) {
		return super.supportsInterface(interfaceId);
	}
}
