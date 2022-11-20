import { HttpJsonRpcConnector, LotusClient } from "filecoin.js";
import { task } from "hardhat/config";
import path from "path";

task("test-filecoin-js", "Gets Filecoin f4 address and corresponding Ethereum address.").setAction(async () => {
  // you must run own lotus node
  const localNodeUrl = "http://127.0.0.1:1234/rpc/v0";
  const adminAuthToken = process.env.LOTUS_TOKEN;
  const localConnector = new HttpJsonRpcConnector({ url: localNodeUrl, token: adminAuthToken });

  const lotusClient = new LotusClient(localConnector);

  const version = await lotusClient.common.version();
  console.log("version", version);

  const chainHead = await lotusClient.chain.getHead();
  console.log("chainHead", chainHead);

  const tipSet = await lotusClient.chain.getTipSetByHeight(7767); // the latest one when I set up this script
  const messages = await lotusClient.chain.getBlockMessages(tipSet.Cids[0]);
  console.log(messages);

  // this is my own address for this test
  const address = "f1lluo4ltqdzcvb7h6bnf3a7lo3lpz6j5tskxr2my";
  const walletBalance = await lotusClient.wallet.balance(address);
  console.log("walletBalance", address, walletBalance);

  // this is test image data
  const importResult = await lotusClient.client.import({
    Path: path.join(__dirname, "../../../data/mAXCg5AIgmtJq7yh1JTsGJkPrA1hLaSnXZIE+MfeeP1bT8OOGb4A.png"),
    IsCAR: false,
  });

  console.log("importResult", importResult.Root);

  // https://github.com/filecoin-project/lotus-docs/blob/2c75117a919ef267bce0548adc79b32e8aa51fbe/content/en/reference/lotus/client.md#clientretrieve
  await lotusClient.client.retrieve(
    {
      Root: {
        "/": "mAXCg5AIg8YBXbFjtdBy1iZjpDYAwRSt0elGLF5GvTqulEii1VcM",
      },
      Size: 42,
      Total: "0",
      UnsealPrice: "0",
      PaymentInterval: 42,
      PaymentIntervalIncrease: 42,
      Client: "t01109",
      Miner: "t01113",
      MinerPeer: {
        Address: "t01113",
      },
    },
    {
      Path: "output-file.png",
      IsCAR: false,
    }
  );
});

module.exports = {};
