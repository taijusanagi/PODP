/* eslint-disable camelcase */
import { expect } from "chai";
import { ethers } from "hardhat";

import { CUSTOME_DEAL_ID } from "../config";
import {
  CustomMarketAPI__factory,
  CustomMinerAPI__factory,
  ProofOfDataPreservation__factory,
} from "../typechain-types";

describe("integration", function () {
  async function fixture() {
    const [signer, owner, beneficiary] = await ethers.getSigners();
    const customMinerAPI = await new CustomMinerAPI__factory(signer).deploy(owner.address);
    const customMarketAPI = await new CustomMarketAPI__factory(signer).deploy(CUSTOME_DEAL_ID, customMinerAPI.address);
    const proofOfDataPreservation = await new ProofOfDataPreservation__factory(signer).deploy(customMarketAPI.address);
    return { signer, owner, beneficiary, customMinerAPI, customMarketAPI, proofOfDataPreservation };
  }

  it("make sure address mapping is correct", async () => {
    const { owner, customMinerAPI, customMarketAPI } = await fixture();
    const getOwnerResult = await customMinerAPI.get_owner();
    expect(getOwnerResult.owner).to.equal(owner.address);
    const getDealProviderResult = await customMarketAPI.get_deal_provider({ id: CUSTOME_DEAL_ID });
    expect(getDealProviderResult.provider).to.equal(customMinerAPI.address);
  });

  it("convertStringAddressToAddress", async () => {
    const { signer, proofOfDataPreservation } = await fixture();
    const result = await proofOfDataPreservation.convertStringAddressToAddress(
      "0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8"
    );
    expect(result).to.equal(signer.address);
  });

  it("claim to owner", async () => {
    const { owner, proofOfDataPreservation } = await fixture();
    const tokenId = await proofOfDataPreservation.totalSupply();
    await expect(proofOfDataPreservation.claim(CUSTOME_DEAL_ID))
      .to.emit(proofOfDataPreservation, "Transfer")
      .withArgs(ethers.constants.AddressZero, owner.address, tokenId);
  });

  it("claim to beneficiary", async () => {
    const { beneficiary, customMinerAPI, proofOfDataPreservation } = await fixture();
    await customMinerAPI.change_beneficiary({
      new_beneficiary: beneficiary.address,
      new_quota: 0, // dummy
      new_expiration: 0, // dummy
    });
    const tokenId = await proofOfDataPreservation.totalSupply();
    await expect(proofOfDataPreservation.claim(CUSTOME_DEAL_ID))
      .to.emit(proofOfDataPreservation, "Transfer")
      .withArgs(ethers.constants.AddressZero, beneficiary.address, tokenId);
  });
});
