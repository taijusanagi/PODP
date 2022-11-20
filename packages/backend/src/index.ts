/* eslint-disable camelcase */
// import Canvas from "canvas";
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

const fileDirectoryPath = path.join(__dirname, "../public");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`ok`);
});

// export const generateImage = async (paylaodCID: string): Promise<Buffer> => {
//   const backgroundImageFile = fs.readFileSync(fileDirectoryPath, `${paylaodCID}.png`);
//   const backgroundImage = new Canvas.Image();
//   backgroundImage.src = backgroundImageFile;
//   const canvas = Canvas.createCanvas(1200, 630);
//   const canvasContext = canvas.getContext("2d");
//   canvasContext.drawImage(backgroundImage, 0, 0);
//   canvasContext.font = "18px Arial";
//   canvasContext.fillText(
//     `
//     PayloadCID: ${paylaodCID}:
//     `,
//     0,
//     0
//   );
//   return canvas.toBuffer("image/jpeg", { quality: 0.4 });
// };

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
  // console.log("owner", owner);
  const outputPath = `${fileDirectoryPath}/${payloadCID}.png`;
  // const imageBuffer = await generateImage(payloadCID as string);
  const generatedPath = `${fileDirectoryPath}/${payloadCID}-generated.png`;
  // fs.writeFileSync(generatedPath, imageBuffer);

  const metadata = {
    name: `PODP #${tokenId}`,
    description: "Proof Of Data Preservation for Filecoin Ecosystem",
    preserver: "0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8", // this should get from the contract
    payloadCID,
    originalImage: `http://localhost:8080/${payloadCID}.png"`,
    image: `http://localhost:8080/${payloadCID}-sbt.png"`,
    attributes: [{ key: "Size", value: 1024 }],
  };

  res.send(metadata);
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
