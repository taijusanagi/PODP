/* eslint-disable camelcase */
import { expect } from "chai";
import { ethers } from "hardhat";

import { CUSTOME_DEAL_ID } from "../config";
import { CustomMarketAPI__factory, CustomMinerAPI__factory } from "../typechain-types";

describe("integration", function () {
  async function fixture() {
    const [signer, owner] = await ethers.getSigners();
    const customMinerAPI = await new CustomMinerAPI__factory(signer).deploy(owner.address);
    const customMarketAPI = await new CustomMarketAPI__factory(signer).deploy(CUSTOME_DEAL_ID, customMinerAPI.address);
    return { signer, owner, customMinerAPI, customMarketAPI };
  }

  it("make sure address mapping is correct", async () => {
    const { owner, customMinerAPI, customMarketAPI } = await fixture();
    const getOwnerResult = await customMinerAPI.get_owner();
    expect(getOwnerResult.owner).to.equal(owner.address);
    const getDealProviderResult = await customMarketAPI.get_deal_provider({ id: CUSTOME_DEAL_ID });
    expect(getDealProviderResult.provider).to.equal(customMinerAPI.address);
  });
});
