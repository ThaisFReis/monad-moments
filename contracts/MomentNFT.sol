// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MomentNFT — 1 moment per day, forever
/// @notice Deployed on Monad (Chain ID 143 / Testnet 10143)
/// @dev ERC-721 with daily mint constraint per address
contract MomentNFT is ERC721, Ownable, Pausable, ReentrancyGuard {

    uint256 private _nextTokenId;

    mapping(uint256 => string) private _contentURIs;
    mapping(uint256 => uint32) private _dayIds;
    mapping(address => mapping(uint32 => bool)) public hasMinted;
    mapping(address => bool) public devWhitelist;

    uint256 public constant MAX_URI_LENGTH = 512;

    event MomentMinted(
        address indexed owner,
        uint256 indexed tokenId,
        uint32 dayId,
        string contentURI,
        uint256 blockTimestamp
    );

    error AlreadyMintedToday();
    error URITooLong();
    error URIEmpty();

    constructor() ERC721("Monad Moments", "MOMENT") Ownable(msg.sender) {
        devWhitelist[0x83D8dA81b98274449Ba427a96a68Ee02c99e564D] = true;
    }

    /// @notice Mint today's moment
    /// @param contentURI The media URI (ipfs://..., ar://..., or https://...)
    /// @return tokenId The newly minted token ID
    function mint(string calldata contentURI)
        external
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        if (bytes(contentURI).length == 0) revert URIEmpty();
        if (bytes(contentURI).length > MAX_URI_LENGTH) revert URITooLong();

        uint32 dayId = uint32(block.timestamp / 1 days);
        if (!devWhitelist[msg.sender]) {
            if (hasMinted[msg.sender][dayId]) revert AlreadyMintedToday();
            hasMinted[msg.sender][dayId] = true;
        }

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        _contentURIs[tokenId] = contentURI;
        _dayIds[tokenId] = dayId;

        emit MomentMinted(msg.sender, tokenId, dayId, contentURI, block.timestamp);

        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _contentURIs[tokenId];
    }

    function getDayId(uint256 tokenId) external view returns (uint32) {
        _requireOwned(tokenId);
        return _dayIds[tokenId];
    }

    function canMintToday(address user) external view returns (bool) {
        if (devWhitelist[user]) return true;
        uint32 dayId = uint32(block.timestamp / 1 days);
        return !hasMinted[user][dayId];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function setDevWhitelist(address account, bool enabled) external onlyOwner {
        devWhitelist[account] = enabled;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
