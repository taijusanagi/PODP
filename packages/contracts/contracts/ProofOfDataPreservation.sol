// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CustomMarketAPI.sol";
import "./CustomMinerAPI.sol";

import "hardhat/console.sol";

contract ProofOfDataPreservation is ERC721 {
  uint256 public totalSupply;

  address public marketAPI;

  constructor(address marketAPI_) ERC721("ProofOfDataPreservation", "PODP") {
    marketAPI = marketAPI_;
  }

  function claim(uint64 dealId) public {
    // get payload cid by deal id
    // todo

    // get provider by deal id
    MarketTypes.GetDealProviderParams memory getProviderParams = MarketTypes.GetDealProviderParams(dealId);
    MarketTypes.GetDealProviderReturn memory getProviderReturn = MarketAPI(marketAPI).get_deal_provider(
      getProviderParams
    );
    address miner = convertStringAddressToAddress(getProviderReturn.provider);

    // get send to address
    // if beneficiary is registered, use beneficiary, if not, use owner
    // NOTE: this is very experimental logic for hackathon, it should be updated according to the upcoming filecoin.sol
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
    _mint(to, totalSupply++);
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
