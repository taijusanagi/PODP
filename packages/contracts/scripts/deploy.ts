/* eslint-disable camelcase */
import fs from "fs";
import { ethers, network } from "hardhat";
import path from "path";

import { BASE_TOKEN_URI } from "../config";
import { callRpc } from "../lib/utils";
import networkJsonFile from "../network.json";
import {
  CustomMarketAPI__factory,
  CustomMinerAPI__factory,
  ProofOfDataPreservation__factory,
} from "../typechain-types";
import { isChainId } from "../types/ChainId";

async function main() {
  const chainId = String(network.config.chainId);
  if (!isChainId(chainId)) {
    throw new Error("chainId invalid");
  }

  // signer = 0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8
  // owner = 0xe68fBECBe7FE5479c15Ad368cB8cDF32EEC5D386
  const [signer, owner] = await ethers.getSigners();
  const fileCoinRPC = networkJsonFile["31415"].rpc;
  const customMinerAPI = await new CustomMinerAPI__factory(signer).deploy(owner.address, {
    maxPriorityFeePerGas: await callRpc(fileCoinRPC, "eth_maxPriorityFeePerGas"),
  });
  await customMinerAPI.deployed();
  console.log("customMinerAPI", customMinerAPI.address);

  networkJsonFile[chainId].deployments.customMinerAPI = customMinerAPI.address;
  fs.writeFileSync(path.join(__dirname, `../network.json`), JSON.stringify(networkJsonFile));

  const customMarketAPI = await new CustomMarketAPI__factory(signer).deploy({
    maxPriorityFeePerGas: await callRpc(fileCoinRPC, "eth_maxPriorityFeePerGas"),
  });
  await customMarketAPI.deployed();
  console.log("customMarketAPI", customMarketAPI.address);

  networkJsonFile[chainId].deployments.customMarketAPI = customMarketAPI.address;
  fs.writeFileSync(path.join(__dirname, `../network.json`), JSON.stringify(networkJsonFile));

  const proofOfDataPreservation = await new ProofOfDataPreservation__factory(signer).deploy(
    customMarketAPI.address,
    BASE_TOKEN_URI,
    {
      maxPriorityFeePerGas: await callRpc(fileCoinRPC, "eth_maxPriorityFeePerGas"),
    }
  );
  await proofOfDataPreservation.deployed();
  console.log("proofOfDataPreservation", proofOfDataPreservation.address);

  networkJsonFile[chainId].deployments.proofOfDataPreservation = proofOfDataPreservation.address;
  fs.writeFileSync(path.join(__dirname, `../network.json`), JSON.stringify(networkJsonFile));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
