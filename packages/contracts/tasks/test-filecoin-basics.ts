import * as fa from "@glif/filecoin-address";
import { task } from "hardhat/config";

import { callRpc } from "../lib/utils";
import networkJsonConfig from "../network.json";

task("test-filecoin-basics", "Gets Filecoin f4 address and corresponding Ethereum address.").setAction(
  async (_, { ethers }) => {
    const [signer] = await ethers.getSigners();
    const fileCoinRPC = networkJsonConfig["3141"].rpc;
    const f4Address = fa.newDelegatedEthAddress(signer.address).toString();
    console.log("f4address (for use with faucet) = ", f4Address);
    console.log("Ethereum address:", signer.address);
    const priorityFee = await callRpc(fileCoinRPC, "eth_maxPriorityFeePerGas");
    console.log("priorityFee", priorityFee);
    const nonce = await callRpc(fileCoinRPC, "Filecoin.MpoolGetNonce", [f4Address]);
    console.log("nonce", nonce);
  }
);

module.exports = {};
