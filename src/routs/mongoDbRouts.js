const express = require("express");
const MGrouter = express.Router();
const mongoose = require("mongoose");
const { MtxLog, DocData, Users } = require("../DBs/dbObjects/MGschemas");
const bodyParser = require("body-parser");
require("dotenv").config();

const Helper = require("./Helper");
// exemple process.env.WHATVER_U_WHANT
const uri =
  "mongodb+srv://yotamos:linux6926@cluster0.zj6wiy3.mongodb.net/mtxlog?retryWrites=true&w=majority";
const MGoptions = { useNewUrlParser: true, useUnifiedTopology: true };
MGrouter.use(express.json());
MGrouter.use(bodyParser.urlencoded({ extended: true }));
MGrouter.use(bodyParser.json());
mongoose
  .connect(uri, MGoptions)
  .then((res) => console.log("conected to mongo...."))
  .catch((e) => console.log(e));

MGrouter.post("/api/loadmatrixes", async (req, res) => {
  let id = await req.body.UserID;
  let body = await req.body;
  console.table({ id });
  MtxLog.find({ UserID: id })
    .sort({ _id: -1 })
    .then((result) => {
      console.log(result);
      res.send({ status: "yes", data: result });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: "no", data: e });
    });
});

MGrouter.post("/api/saveMatrix", async function (req, res) {
  let body = await req.body;
  const { matrixID, UserID, matrixesData } = body;
  let inDataBase = await Users.find({ _id: UserID });
  if (inDataBase.length == 0)
    return res.send({ status: "no", data: "user id not found" });
  let reqMtxData = new MtxLog({
    matrixID: matrixID,
    UserID: UserID,
    matrixesData: matrixesData,
  });

  reqMtxData
    .save()
    .then((result) => {
      console.log(result);
      res.send({ status: "yes", data: result });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: "no", data: e });
    });
});

MGrouter.post("/api/loadDocUrls", async (req, res) => {
  DocData.find()
    .then((result) => {
      console.log(result);
      res.send({ status: "yes", data: result });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: "no", data: e });
    });
});

MGrouter.post("/api/register", async (req, res) => {
  let body = await req.body;
  let headers = Object.keys(body);
  let newUser = {};
  const userExist = await Users.findOne({ Mail: body.Mail });

  if (userExist) return res.send({ error: "user mail exist in the data base" });

  headers.forEach((header) => {
    newUser[header] = body[header];
  });
  let user = new Users(newUser);
  user
    .save()
    .then((result) => {
      console.log(result);
      res.send({ status: "yes", data: result });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: "no", data: e });
    });
});

MGrouter.post("/api/getdata", async (req, res) => {
  let { collection, searchParams } = await req.body;
  if (!collection || !searchParams)
    return res.send({ status: "no", data: "error in search params" });
  let searchResult = await Helper.getData(collection, searchParams);
  return res.send(searchResult);
});

MGrouter.post("/api/handleLogin", async (req, res) => {
  let searchParams = await req.body;
  let searchResult = await Helper.getData("Users", searchParams);

  if (searchResult.status == "no")
    return res.send({ ststus: "no", data: "no record in data base" });
  else
    return res.send({
      status: "yes",
      configObj: Helper.mockConfig,
      userID: searchResult.data[0]._id,
    });
});

MGrouter.post("/api/setConfig", async (req, res) => {
  let configObj = await req.body;

  let lengthOfData;
  try {
    lengthOfData = await Users.find({ _id: configObj.userID });
  } catch (e) {
    console.log(e);
    return res.send(e);
  }
  console.log(lengthOfData);
  if (!configObj || lengthOfData == 0)
    res.send({ status: "no", data: "no user in data base" });
  Helper.setConfig(configObj)
    .then((searchResult) => {
      console.log("seracadfasf", searchResult);
      return res.send(searchResult);
    })
    .catch((e) => console.log("bad format"));
});
module.exports = MGrouter;