import * as dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`ok`);
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
