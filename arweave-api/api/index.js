const express = require("express");
const Irys = require("@irys/sdk");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express on Vercel running...");
});

app.post("/", async (req, res) => {
  const getIrys = async () => {
    const key = {
      kty: "RSA",
      n: "9Qek2j1339I0QXj6AhqUYAqvTN3A0zF6HrSWLS09P1QZi8ECoBneFvYgRrG627bLp8rcI0-vDm0VhX56Wu7LHTRmx7xVTgr9-JzrsaHKS8uF8h5nMVYGRvbLZqbye_TGIW3IUtvAcOkXAaWBMYdrl1V1-5RaILXvS2G8WlPhfa64_LfR1Ts17qN-GzoZn-U67UTgHQY8HpzzIhQAAmPTThC8OhaH4G_RG8wyitD8jSfJUSOybQJ1ahDhwz1uNqngj_oRLeSG3dMKv2APUWzHew7V4LvVgqWYzdq83tNck0CV-bNzT2Uodzh2p_WkjoJsYHnxTUcQtupW-ffI0xFkykA4Vgdvgsj8cOHbNi9MTCSgt0i6UYl2CaV94NfXKpoDK-Av4hjZyj5Jvkx2oEkfhx9JW7t1zAUBtprm3gwOrwGKCPs-X2xPdPf2m0ePtsCBc7m42jO6aXqoqQrZv4Lhrp6yc4aovfOzHbWPkvLLNUUSeuZcRwOFVRIuZFAQm-o9LHKsBwjaGhK3ZeOtxX1hGfrwyy5sr7qrWSEo00X-uJDaiXArZZ2SO7NBDQsQ03UrNMIScAP-sALjAa5SODHf2XCIc2Bm0b0FeUlUhP-an7WA0_tJ0GceK6WoCB3O8MyrhfbZlInfy2UK3yee-jsNntirkiqZ7oKZtjfubWwdJDk",
      e: "AQAB",
      d: "E7Cfb0-m80ASpau9aF-fKngVVeeQdBAq5G6Fzl_PJwiArIWwKrIlcgIpfhDQZ5FA_IztQ3Om6TF8HB_5oFbF0OUZ-MUyNC0nMzwV5w5toYlbbEVD7NehNcDlf6xc-jfFV6CZK0pgJJqgeAgHEZY0n8K08khdtTj1f6DdGEObEETS9fDmDlzdlL2D19eDgWEz6ubg3Qg4GswpMAT8KrT_oQtwerj-hnspyjJuoc_RKZ0nvOrRztd2nLU6VRx5v7AHPP6e9ImDim4H9DC5jmUfwwxiRLbHXaIlvS4NhRjmPKmBG8GPO7Mw7SKnC1BunqqNn7OQ39E8_zvlzRy7oTVpvDwqmSrbXr7rqDolR2X3kpBAKES_0ZidIMBv_crLOT2XXmqBlVbWUQkwSv_CmabEFpSn6jD9SbTXZfnzvcISKAY10s9XX_TU5KIxTGSVFlNTJ8zRsv1mrwNorP0yqEAPiHgJPTh4QUnMixIz4BNeTXZSFmt1EMvMn9BQm86EWiF6-UYG6Mtgiq5xcIhcL76C0HKcJJd4-RZ5g7IVLMiJ_-GABGE4e2hM3HYUpYfzU56JSvFYTz9_jT6M6bFgRlPEIYgMzNy9mGWNzU71CDeUT20BZGl3qWNLzzD_XE0dVae9c3v39-eCOxfmw8_H9zWnFl0vMyB32xY2lg7Qf1T-5PE",
      p: "_qrxX2z6qC3xEhY0OnQxvWXaPTjwsQaEF7InZWMunqIki12BUTQyE81DxttUrDdvxsvVe-RBCfh8Au8k6nV2L1-HkB9C18RDTy9N6S0l_WUmDMi5-T-GB2cFbFP6FJvB-tWYl6EfcCwfF24x3Qy6RhRbspKBaHRMNLlSs3_G-YX_Gh7tJRFKIQe2brB8S65V-WBlEL1udH19KSfddEJxeZu5aKv2FUpJgB6z1_GcFMkIE6OHhUuCHPoXalbOHt1PJvBL8ecpDaDSwLJDhv2eaDAk9jaDmMNyox3k9AF_MqXl2lMsSR0utXkz7xVM88gQ9ivdX8NJsC-bkHjgJ2c7qQ",
      q: "9k_LNsnjwzyO1GGUSSXgy-c8DuwOFWmUXVyv9dVwr57ihvtHak0sIRzfC57PzxwAlY0X2-gC1cukdkIM3ARd1o3v2NBWG0fQ1FrZOF9sJQfkp3zTVAKeXtlgAiqhI38q6Z7aOxmXq1RAdFcd1TnUyp_zuvleBhYBb81mYb7jkWdmwS6X2wGOTX45wDce-ojx0BYnBr5TyocfryrjFO53M-4uGMww8F98LUJdcsi1_qaVFu7eyD6vYoVOjw_vrXoq9DNJLvR2eDLcr2VnyfL6a6N7sCfc9kD78Yqs_7xhbdR-bB1RZrM1tF6-ylMmE0ZOkA8MhQjwzwDbEhVKTt1-EQ",
      dp: "K_L4QM2f3FJBXiuyy7utsc_X_-TJtOM4_JXkMp0ROJMm115FqOvnEH_GCJVlYWsXwSkAKKdVihD15dO7fTLUOIy16mtar73RF-NEAM-n1LkV_fLOFXOe_7wJtY4whEn1CgK-mLxXnpYer3524H0H0HxG7uRVrN8VH6wz14JfpkQ3qBxaNKFtN5ILK8MNUEo_0A-QoXjvjO7zIJ0enKeyyZfUQXobt8TgNloWE1hA5V1kJW99PcWwKKwISnO8kpsCw-eIU7De5tkwRcz91lgCdFyKpGr3_u8L45aPIoT3nJgAuNLNu7hrjSnjiokUhKWsN6-OPq6HEv7ETARwOpyYMQ",
      dq: "vJsXKWnofMw3NktN58EYZCo5I9f_ZMgGsoLRvjVk5yWLof5xjeVwAB8Cb_x4dcekbt-uQFZlLV6VHXSwMh0p2auv196XwKX6M1EpefAfeC-WF-YOUAr9R_W9fYs0_mBW9LMNuil7qNaH0E4Q6wAwf8OBN0_RfmmFSh4G4pvv15xM42oRH8MOOyqHgDb1ArSwLT15PsGombFkQpZdcd6z6lDcfWKFqtoC1Qk3Uzh7m3XlPb1FXCIb3B3lrMhwJ-8fSwSmak0JFjskHy5QDiR_OsLhaF7t5KaYBTnCBMUz-Yy4DYNZnIFngyj1gSmwQxwX9ll_pbLV6jxmg29ICiGycQ",
      qi: "RWrLdWusF6M-s_yCvVF3u0tRLDO2HbfnhvOfANEJOb47mm4f3AjfLj2bC9tMCBPLeyFeHczW48GBZhHFc8dZQm_j1RucNcx3zk0v_gvY6Uzq2EEbPcWwi0upp9bI2zPKxQxI2GR70rOW8_4F_Cmjm7TaIcmJ9mmNsW8jqEyRDik68uRfc7a9_wvilHvX8jHl-jiPnve4DpUUiGDU0ssnn5zM9Zhgwrhju0zglQ-lSf2IvjBCAvlmRej_GPuJhp5kIKonsJOBwNl8Bta9x_hvGhmyQRVBPBKU9y_ljljdacM03sAbc7H_6q_bqJfIq5W7pNpBDq3BrKRJ4uXhlyPRSQ",
    };
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
