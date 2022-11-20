// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.25 <=0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./filecoinMockAPIs/MarketAPI.sol";

contract CustomMarketAPI is MarketAPI {
  constructor(uint64 customDealId, string memory customMiner, string memory customPayloadCID) {
    mock_custom_generate_deals(customDealId, customMiner, customPayloadCID);
  }

  // dealId, minter, payload is dynamic for the better testing
  function mock_custom_generate_deals(
    uint64 customDealId,
    string memory customMiner,
    string memory customPayloadCID
  ) internal {
    MarketTypes.MockDeal memory custom_deal;
    custom_deal.id = customDealId;
    custom_deal.cid = "baga6ea4seaqlkg6mss5qs56jqtajg5ycrhpkj2b66cgdkukf2qjmmzz6ayksuci";
    custom_deal.size = 8388608;
    custom_deal.verified = false;
    custom_deal.client = "t01109";
    custom_deal.provider = customMiner;
    custom_deal.label = customPayloadCID;
    custom_deal.start = 25245;
    custom_deal.end = 545150;
    custom_deal.price_per_epoch = 1100000000000;
    custom_deal.provider_collateral = 0;
    custom_deal.client_collateral = 0;
    custom_deal.activated = 1;
    custom_deal.terminated = 0;
    deals[custom_deal.id] = custom_deal;
  }
}
