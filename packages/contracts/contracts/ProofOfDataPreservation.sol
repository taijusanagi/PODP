// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CustomMarketAPI.sol";
import "./CustomMinerAPI.sol";

contract ProofOfDataPreservation is ERC721 {
  mapping(uint256 => string) public payloadCIDs;

  event Claimed(uint64 indexed dealId, address indexed to, uint256 indexed tokenId, string payloadCID);

  uint256 public totalSupply;
  MarketAPI public marketAPI;
  string public baseTokenURI;

  constructor(address marketAPI_, string memory baseTokenURI_) ERC721("ProofOfDataPreservation", "PODP") {
    marketAPI = MarketAPI(marketAPI_);
    baseTokenURI = baseTokenURI_;
  }

  function claim(uint64 dealId) public {
    uint256 tokenId = totalSupply;

    // get payload cid by deal id
    MarketTypes.GetDealLabelReturn memory getDealLabelReturn = marketAPI.get_deal_label(
      MarketTypes.GetDealLabelParams(dealId)
    );

    // this works for the provided test data
    string memory payloadCID = getDealLabelReturn.label;
    payloadCIDs[tokenId] = payloadCID;

    // get provider by deal id
    MarketTypes.GetDealProviderReturn memory getProviderReturn = marketAPI.get_deal_provider(
      MarketTypes.GetDealProviderParams(dealId)
    );
    address miner = convertStringAddressToAddress(getProviderReturn.provider);

    // get send to address
    // if beneficiary is registered, use beneficiary, if not, use owner
    // this is very experimental logic for hackathon, it should be updated according to the upcoming filecoin.sol
    CustomMinerAPI minerAPI = CustomMinerAPI(miner);
    address to;
    try minerAPI.get_beneficiary() returns (MinerTypes.GetBeneficiaryReturn memory result) {
      to = convertStringAddressToAddress(result.active.beneficiary);
      // result.
    } catch {
      MinerTypes.GetOwnerReturn memory getOwnerReturn = minerAPI.get_owner();
      to = convertStringAddressToAddress(getOwnerReturn.owner);
    }

    // send token to the miner address
    _mint(to, tokenId);
    emit Claimed(dealId, to, tokenId, payloadCID);
    totalSupply++;
  }

  // this can be onchain nft, but I make token metadata generation off-chain for the simplicity
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    return string.concat(super.tokenURI(tokenId), "?payloadCID=", payloadCIDs[tokenId]);
  }

  function _baseURI() internal view override returns (string memory) {
    return baseTokenURI;
  }

  // this is to restrict the transfer of minted token
  function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal override {
    require(from == address(0x0), "ProofOfDataPreservation: transfer is not allowed");
    super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
  }

  // this is to restrict the listing in NFT market
  function _setApprovalForAll(address owner, address operator, bool approved) internal override {
    revert("ProofOfDataPreservation: setApprovalForAll is not allowed");
  }

  // this is to restrict the listing in NFT market
  function _approve(address to, uint256 tokenId) internal override {
    revert("ProofOfDataPreservation: _approve is not allowed");
  }

  // this method is not efficient, but it works properly to get the send to address from string data
  function convertStringAddressToAddress(string memory stringAddress) public pure returns (address) {
    require(bytes(stringAddress).length == 42, "ProofOfDataPreservation: address length is invalid");
    require(
      keccak256(abi.encodePacked(substring(stringAddress, 0, 2))) == keccak256(abi.encodePacked("0x")),
      "ProofOfDataPreservation: address prefix is invalid"
    );
    return address(bytes20(fromHex(substring(stringAddress, 2, 42))));
  }

  /*
   * https://ethereum.stackexchange.com/questions/39989/solidity-convert-hex-string-to-bytes
   */
  function fromHex(string memory s) public pure returns (bytes memory) {
    bytes memory ss = bytes(s);
    require(ss.length % 2 == 0); // length must be even
    bytes memory r = new bytes(ss.length / 2);
    for (uint i = 0; i < ss.length / 2; ++i) {
      r[i] = bytes1(fromHexChar(uint8(ss[2 * i])) * 16 + fromHexChar(uint8(ss[2 * i + 1])));
    }
    return r;
  }

  /*
   * https://ethereum.stackexchange.com/questions/39989/solidity-convert-hex-string-to-bytes
   */
  function fromHexChar(uint8 c) public pure returns (uint8) {
    if (bytes1(c) >= bytes1("0") && bytes1(c) <= bytes1("9")) {
      return c - uint8(bytes1("0"));
    }
    if (bytes1(c) >= bytes1("a") && bytes1(c) <= bytes1("f")) {
      return 10 + c - uint8(bytes1("a"));
    }
    if (bytes1(c) >= bytes1("A") && bytes1(c) <= bytes1("F")) {
      return 10 + c - uint8(bytes1("A"));
    }
    revert("fail");
  }

  /*
   * https://ethereum.stackexchange.com/questions/31457/substring-in-solidity
   */
  function substring(string memory str, uint startIndex, uint endIndex) public pure returns (string memory) {
    bytes memory strBytes = bytes(str);
    bytes memory result = new bytes(endIndex - startIndex);
    for (uint i = startIndex; i < endIndex; i++) {
      result[i - startIndex] = strBytes[i];
    }
    return string(result);
  }
}
