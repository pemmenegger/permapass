const express = require("express");
const Irys = require("@irys/sdk");
const fs = require("fs");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express on Vercel running...");
});

app.post("/", async (req, res) => {
  const getIrys = async () => {
    const key = JSON.parse(fs.readFileSync("wallet.json").toString());
    const irys = new Irys({
      network: "mainnet",
      token: "arweave",
      key,
    });
    return irys;
  };

  const uploadData = async (dataToUpload) => {
    const irys = await getIrys();
    try {
      console.log("Uploading data to Arweave...");
      console.log("Data to upload: ", dataToUpload);
      const receipt = await irys.upload(Buffer.from(JSON.stringify(dataToUpload)));
      console.log(`Data uploaded ==> https://arweave.net/${receipt.id}`);
      return `https://arweave.net/${receipt.id}`;
    } catch (e) {
      console.log("Error uploading data ", e);
      throw e;
    }
  };

  try {
    const dataToUpload = req.body;
    const url = await uploadData(dataToUpload);
    res.json({ url });
  } catch (e) {
    console.error("Error uploading data to Arweave: ", e);
    res.status(500).send("Error uploading data to Arweave");
  }
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
