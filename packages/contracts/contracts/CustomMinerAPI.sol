// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.25 <=0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./filecoinMockAPIs/MinerAPI.sol";

contract CustomMinerAPI is MinerAPI {
  constructor(string memory owner) MinerAPI(owner) {}
}
