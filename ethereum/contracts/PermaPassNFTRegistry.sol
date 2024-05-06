// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { ERC721Burnable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract PermaPassNFTRegistry is
	ERC721,
	ERC721URIStorage,
	ERC721Burnable,
	Ownable
{
	uint256 private _nextTokenId;
	mapping(uint256 => uint256) private _nextVersions;
	mapping(uint256 => uint256) public changed;

	event Minted(address indexed to, string uri, uint256 tokenId);
	event TokenURIChanged(
		uint256 indexed tokenId,
		address sender,
		string uri,
		uint256 version,
		uint256 previousChange
	);

	constructor(
		address initialOwner
	) ERC721("PermaPassNFTRegistry", "PPR") Ownable(initialOwner) {}

	function safeMint(address to, string memory uri) external {
		uint256 tokenId = _nextTokenId++;
		uint256 version = _nextVersions[tokenId]++;
		_safeMint(to, tokenId);
		_setTokenURI(tokenId, uri);
		emit Minted(to, uri, tokenId);
		emit TokenURIChanged(tokenId, msg.sender, uri, version, 0);
		changed[tokenId] = block.number;
	}

	function setTokenURI(
		uint256 tokenId,
		string memory uri
	) external onlyOwner {
		uint256 version = _nextVersions[tokenId]++;
		_setTokenURI(tokenId, uri);
		emit TokenURIChanged(
			tokenId,
			msg.sender,
			uri,
			version,
			changed[tokenId]
		);
		changed[tokenId] = block.number;
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
