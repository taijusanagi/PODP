// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.25 <=0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ProofOfDataPreservation is ERC721 {
  uint256 public totalSupply;

  address public marketAPI;

  constructor(address marketAPI_) ERC721("ProofOfDataPreservation", "PODP") {
    marketAPI = marketAPI_;
  }

  function claim(uint64 dealId) public {
    // get payload cid by deal id
    // get miner by deal id
    // MarketTypes.GetDealProviderParams memory getProviderParams = MarketTypes.GetDealProviderParams(dealId);
    // MarketTypes.GetDealProviderReturn memory getProviderReturn = MarketAPI(marketAPI).get_deal_provider(
    //   getProviderParams
    // );
    // string memory miner = getProviderReturn.provider;
    // // bytes20(bytes(miner));
    // // get miner evm address to airdrop
    // address minerAddress = address(0x0); // this is the question
    // // send token to the miner address
    // _mint(minerAddress, totalSupply++);
  }
}
