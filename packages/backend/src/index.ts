/* eslint-disable camelcase */
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import express from "express";
import { HttpJsonRpcConnector, LotusClient } from "filecoin.js";
import fs from "fs";
import path from "path";

import { BASE_TOKEN_URI } from "../../contracts/config";
import networkJsonFile from "../../contracts/network.json";
import { ProofOfDataPreservation__factory } from "../../contracts/typechain-types";

dotenv.config();

const fileDirectoryPath = path.join(__dirname, "./files");

const app = express();
app.use(express.json());
// app.pu

app.get("/", (req, res) => {
  res.send(`ok`);
});

app.get("/metadata/:tokenId", async (req, res) => {
  const { tokenId } = req.params;
  const { payloadCID } = req.query;
  if (tokenId === undefined) {
    throw new Error("token id is missing in request");
  }
  const provider = new ethers.providers.JsonRpcProvider(networkJsonFile["31415"].rpc);
  const contract = ProofOfDataPreservation__factory.connect(
    networkJsonFile["31415"].deployments.proofOfDataPreservation,
    provider
  );
  console.log("tokenId", tokenId);
  console.log("payloadCID", payloadCID);
  // const owner = await contract.ownerOf(tokenId).catch(() => undefined);
  // if (!owner) {
  //   res.send(`token is not minted yet`);
  // }
  console.log("owner", owner);
  const outputPath = `${fileDirectoryPath}/${payloadCID}.png`;

  const metadata = {
    image: `http://localhost:8080//"`,
  };

  const image = fs.readFileSync(outputPath);

  res.send(`ok`);
});

app.post("/retrieve", async (req, res) => {
  if (!process.env.LOTUS_TOKEN) {
    throw new Error("lotus token not set");
  }

  const { payloadCID } = req.body;

  if (payloadCID === undefined) {
    throw new Error("payload cid is missing in request");
  }

  // check the retrieval is first time for the data
  const outputPath = `${fileDirectoryPath}/${payloadCID}.png`;
  if (fs.existsSync(outputPath)) {
    return res.send("already processed");
  }

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
