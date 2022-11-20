import * as dotenv from "dotenv";
import express from "express";
import { HttpJsonRpcConnector, LotusClient } from "filecoin.js";
import fs from "fs";
import path from "path";

dotenv.config();

const fileDirectoryPath = path.join(__dirname, "./files");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`ok`);
});

app.post("/retrieve", async (req, res) => {
  if (!process.env.LOTUS_TOKEN) {
    throw new Error("lotus token not set");
  }

  const { tokenId, payloadCID } = req.body;

  if (tokenId === undefined) {
    throw new Error("token id is missing in request");
  }

  if (payloadCID === undefined) {
    throw new Error("payload cid is missing in request");
  }

  // check the retrieval is first time for the data
  const outputPath = `${fileDirectoryPath}/${payloadCID}.png`;
  if (fs.existsSync(outputPath)) {
    return res.send("already processed");
  }

  // check if the token is minted

  // check the dire

  const localNodeUrl = "http://127.0.0.1:1234/rpc/v0";
  const adminAuthToken = process.env.LOTUS_TOKEN;
  const localConnector = new HttpJsonRpcConnector({ url: localNodeUrl, token: adminAuthToken });
  const lotusClient = new LotusClient(localConnector);
  await lotusClient.client.retrieve(
    {
      Root: {
        "/": payloadCID,
      },
      // use data from https://wallaby.filecoin.tools/baga6ea4seaqlkg6mss5qs56jqtajg5ycrhpkj2b66cgdkukf2qjmmzz6ayksuci
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
      Path: outputPath,
      IsCAR: false,
    }
  );
  res.send("ok");
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
