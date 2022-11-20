/* eslint-disable camelcase */
import { expect } from "chai";
import { ethers } from "hardhat";

import { BASE_TOKEN_URI, CUSTOME_DEAL_ID, CUSTOME_PAYLOAD_CID } from "../config";
import {
  CustomMarketAPI__factory,
  CustomMinerAPI__factory,
  ProofOfDataPreservation__factory,
} from "../typechain-types";
import { ADDRESS_1 } from "./helper/dummy";

describe("integration", function () {
  async function fixture() {
    const [signer, owner, beneficiary] = await ethers.getSigners();
    const customMinerAPI = await new CustomMinerAPI__factory(signer).deploy(owner.address);
    await customMinerAPI.deployed();
    const customMarketAPI = await new CustomMarketAPI__factory(signer).deploy(
      CUSTOME_DEAL_ID,
      customMinerAPI.address,
      CUSTOME_PAYLOAD_CID
    );
    await customMarketAPI.deployed();
    const proofOfDataPreservation = await new ProofOfDataPreservation__factory(signer).deploy(
      customMarketAPI.address,
      BASE_TOKEN_URI,
      false, // claim is done at each testing
      "0"
    );
    await proofOfDataPreservation.deployed();

    return { signer, owner, beneficiary, customMinerAPI, customMarketAPI, proofOfDataPreservation };
  }

  describe("deployments", function () {
    it("should work", async () => {
      const { owner, customMinerAPI } = await fixture();
      const getOwnerResult = await customMinerAPI.get_owner();
      expect(getOwnerResult.owner).to.equal(owner.address);
    });
  });

  // keep this for the reference
  // this is replaced by below "address and filecoin id conversion" in actual contract
  describe("convertStringAddressToAddress -- old", function () {
    it("should work", async () => {
      const { signer, proofOfDataPreservation } = await fixture();
      const result = await proofOfDataPreservation.convertStringAddressToAddress(
        "0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8"
      );
      expect(result).to.equal(signer.address);
    });
  });

  // https://discord.com/channels/554623348622098432/1043770423663415306/1043830489837994015
  describe("address and filecoin id conversion", function () {
    it("should work", async () => {
      const { proofOfDataPreservation } = await fixture();
      const filecoinID = "t01113";
      // use ethers utils to get checksum address
      const filecoinIDInAddress = ethers.utils.getAddress("0xff00000000000000000000000000000000000459");
      expect(await proofOfDataPreservation.covertFilecoinIDToAddress(filecoinID)).to.eq(filecoinIDInAddress);
    });
  });

  describe("claim", function () {
    it("should work when claim to owner", async () => {
      const { owner, proofOfDataPreservation } = await fixture();
      const tokenId = await proofOfDataPreservation.totalSupply();

      await expect(proofOfDataPreservation.claim(CUSTOME_DEAL_ID))
        .to.emit(proofOfDataPreservation, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, tokenId)
        .to.emit(proofOfDataPreservation, "Claimed")
        .withArgs(CUSTOME_DEAL_ID, owner.address, tokenId, CUSTOME_PAYLOAD_CID);
      expect(await proofOfDataPreservation.payloadCIDs(tokenId)).to.eq(CUSTOME_PAYLOAD_CID);
    });

    it("should work claim to beneficiary", async () => {
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

  describe("tokenURI", function () {
    it("should work", async () => {
      const { proofOfDataPreservation } = await fixture();
      const tokenId = await proofOfDataPreservation.totalSupply();
      await proofOfDataPreservation.claim(CUSTOME_DEAL_ID);
      expect(await proofOfDataPreservation.tokenURI(tokenId)).to.eq(
        `${BASE_TOKEN_URI}${tokenId}?payloadCID=${CUSTOME_PAYLOAD_CID}`
      );
    });

    it("should work claim to beneficiary", async () => {
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

  describe("SBT", function () {
    it("should work", async () => {
      const { owner, proofOfDataPreservation } = await fixture();
      const tokenId = await proofOfDataPreservation.totalSupply();
      await expect(proofOfDataPreservation.claim(CUSTOME_DEAL_ID))
        .to.emit(proofOfDataPreservation, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, tokenId);
      await expect(
        proofOfDataPreservation.connect(owner).transferFrom(owner.address, ADDRESS_1, tokenId)
      ).to.revertedWith("ProofOfDataPreservation: transfer is not allowed");
      await expect(proofOfDataPreservation.connect(owner).setApprovalForAll(ADDRESS_1, true)).to.revertedWith(
        "ProofOfDataPreservation: setApprovalForAll is not allowed"
      );
      await expect(proofOfDataPreservation.connect(owner).approve(ADDRESS_1, tokenId)).to.revertedWith(
        "ProofOfDataPreservation: _approve is not allowed"
      );
    });
  });

  describe("Addon Contractor Claim", function () {
    it("should work", async () => {
      const { signer, customMarketAPI } = await fixture();
      const proofOfDataPreservation = await new ProofOfDataPreservation__factory(signer).deploy(
        customMarketAPI.address,
        BASE_TOKEN_URI,
        false, // claim is done at each testing
        "0"
      );
      console.log("ok", proofOfDataPreservation.address);
    });
  });
});
