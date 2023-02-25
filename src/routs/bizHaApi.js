/*
--- extract the user id header extraction to a public function 
*/

const express = require("express");
const HArouter = express.Router();
const mongoose = require("mongoose");
const Validator = require("./validator");
const fbHelper = require("../DBs/fbHelper");
const cors = require("cors");
const utfZone = "en";
HArouter.use(
  cors({
    origin: "*",
  })
);
const { MtxLog, DocData, Users, BiRows, Config } = require("../DBs/dbObjects/matrix_Ui_Schemas");
const bodyParser = require("body-parser");
require("dotenv").config();

const Helper = require("./Helper");
const { async } = require("@firebase/util");
// exemple process.env.WHATVER_U_WHANT
const uri = "mongodb+srv://yotamos:linux6926@cluster0.zj6wiy3.mongodb.net/mtxlog?retryWrites=true&w=majority";
const MGoptions = { useNewUrlParser: true, useUnifiedTopology: true };
HArouter.use(express.json());
HArouter.use(bodyParser.urlencoded({ extended: true }));
HArouter.use(bodyParser.json());
mongoose
  .connect(uri, MGoptions)
  .then((res) => console.log("conected to mongo...."))
  .catch((e) => console.log(e));

HArouter.post("/api/loadmatrixes", Helper.authenticateToken, async (req, res) => {
  //let id = await req.body.userID;
  let reqAmount = await req.body.amount;
  //let amount = reqAmount ? reqAmount : 1;
  let user = await req.user;
  console.log({ user });
  let userID;
  try {
    userID = user?.fetchedData?.userID ? user.fetchedData.userID : user.userID;
  } catch (e) {
    console.log("*******  no id in request *******");
  }

  //console.log("amount ", amount);
  console.table({ userID });
  MtxLog.findOne({ userID: userID })
    .sort({ _id: -1 })
    .then((result) => {
      console.log(result);
      console.log("result.length ssss", result.length);
      res.send({
        status: result.length == 0 ? "no" : "yes",
        data: [result],

        // result.splice(0, result.length > amount ? amount : result.length),
      });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: "no", data: e });
    });
});

const userVlidation = async (req) => {
  let user = await req.user;
  console.log({ user });
  let userID;
  try {
    userID = user?.fetchedData?.userID ? user.fetchedData.userID : user.userID;
  } catch (e) {
    console.log("*******  no id in request *******");
  }

  console.log(userID);

  let inDataBase;
  try {
    inDataBase = await Users.find({ _id: userID });
  } catch (e) {
    console.log(e);
    return res.send({ status: "no", data: e });
  }
  return { userID, inDataBase };
};

const validateName = async (Name, userID) => {
  const isExist = await MtxLog.find({ userID: userID, matrixName: Name });
  if (isExist?.length) return validateName(`${Name} (${crypto.randomUUID().slice(0, 4)})`, userID);
  else return Name;
};

HArouter.post("/api/saveMatrix", Helper.authenticateToken, async (req, res) => {
  let body = await req.body;
  const { matrixID, matrixesData } = body;
  const pulledMatrixData = matrixesData?.matrixesData;
  const { userID, inDataBase } = await userVlidation(req);
  if (inDataBase.length == 0) return res.send({ status: "no", data: "user id not found" });
  let saveObject = {
    status: "yes",
    newName: false,
    data: false,
  };

  let reqMtxData = {
    Date: body.Date ? body.Date : new Date().toLocaleString(utfZone, { timeZone: "Asia/Jerusalem" }),
    matrixName: body.matrixName ? body.matrixName : matrixID,
    matrixID: matrixID,
    userID: userID,
    isBI: body.isBI ? body.isBI : false,
    isProduced: body.isProduced ? body.isProduced : false,
    isInitiated: body.isInitiated ? body.isInitiated : false,
    matrixesData: pulledMatrixData ? pulledMatrixData : matrixesData,
    matrixesUiData: body.matrixesUiData ? body.matrixesUiData : null,
  };
  const prevName = reqMtxData["matrixName"];
  reqMtxData["matrixName"] = await validateName(reqMtxData["matrixName"]);
  if (prevName != reqMtxData["matrixName"]) {
    saveObject.status = "no";
    saveObject.newName = reqMtxData["matrixName"];
  }

  const searchData = await MtxLog.find({ matrixID: matrixID });
  if (searchData.length == 0) {
    new MtxLog(reqMtxData)
      .save()
      .then((result) => {
        console.log("***************************** saving matrix data !!!! ******************************");
        res.send({ status: "yes", data: result, saveStatus: { ...saveObject } });
      })
      .catch((e) => {
        console.log(e);
        res.send({ status: "no", data: e });
      });
  } else {
    MtxLog.updateOne(
      { matrixID: matrixID },
      {
        $set: { ...body, id: searchData[0]._id },
      }
    )
      .then((result) => {
        console.log("***************************** updating matrix data !!!! ******************************");
        console.log({ result });
        res.send({ status: "yes", data: result, saveStatus: { ...saveObject } });
      })
      .catch((e) => {
        saveObject.data.error = {
          number: 1,
          content: "catch block in save matrix, db server",
        };
        saveObject.status = "no";
        saveObject.newName = false;
        console.log(e);
        res.send({ status: "no", data: e, saveStatus: { ...saveObject } });
      });
    console.log("is bi :", body.isBI);
  }
  if (body.isBI) saveDataForBi(reqMtxData, userID);
  else console.log("no i needed");
});

const saveDataForBi = async (reqMtxData, userID) => {
  console.log("++++++++++++++++++++ save to Bi ++++++++++++++++++");
  const reportID = JSON.stringify({
    TID: "1",
  });

  let biData = [];
  let dataRow = {};
  let data;
  try {
    data = reqMtxData.matrixesData;
  } catch (e) {
    console.log(e);
    return { status: "no", data: `in saveDataForBi func \n ${e}` };
  }

  if (!Array.isArray(data.mainMatrix.cellsData))
    return res.send({
      status: "no",
      data: `data.mainMatrix.cellsData is not an Array`,
    });

  data.mainMatrix.cellsData.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      //   console.log("cell ", cell);
      dataRow = {
        userID: reqMtxData.userID,
        Date: reqMtxData.Date,
        AccountKey: data.mainMatrix.AccountKey[rowIndex],
        DocumentID: data.mainMatrix.DocumentID[rowIndex],
        itemKey: data.mainMatrix.itemsHeaders[cellIndex],
        itemName: data.mainMatrix.itemsNames
          ? data.mainMatrix.itemsNames[cellIndex]
          : data.mainMatrix.itemsHeaders[cellIndex],
        Quantity: cell,
      };
      biData.push(dataRow);
      dataRow = {};
    });
  });

  let rows = new BiRows(biData);

  biData.length > 1
    ? BiRows.insertMany(biData)
        .then((result) => {
          //   console.log("****** BiData ******\n", result);
          return { status: "yes", data: result };
        })
        .catch((e) => {
          console.log(e);
          return { status: "no", data: e };
        })
    : rows
        .save()
        .then((result) => {
          //  console.log("!!!!!!!!!! result !!!!!!!!!!!", result);
          return { status: "yes", data: result };
        })
        .catch((e) => {
          //   console.log(e);
          return { status: "no", data: e };
        });
};

HArouter.post("/api/loadDocUrls", Helper.authenticateToken, async (req, res) => {
  let userID;
  let user = await req.user;

  console.log("user before try $$$$\n");
  try {
    userID = (await user.fetchedData?.userID) ? user.fetchedData.userID : user.userID;
  } catch (e) {
    console.log("*******  no id in request *******");
    return res.send("problem with id");
  }

  //if(!userID) return res.send({ status: "no", data:'no user id' });

  DocData.find({ userID: userID })
    .exec()
    .then((result) => {
      // console.log(result);
      res.send({ status: "yes", data: result });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: "no", data: e });
    });
});

HArouter.post("/api/register", async (req, res) => {
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

HArouter.post("/api/getdata", Helper.authenticateToken, async (req, res) => {
  let { collection, searchParams } = await req.body;
  if (!searchParams) searchParams = {};
  let userID;
  let user = await req.user;
  console.log("before \n", { searchParams });
  // if (searchParams.Date) searchParams.Date = new Date(searchParams.Date);

  console.log("after \n", { searchParams });
  console.log({ user });

  try {
    userID = (await user.fetchedData?.userID) ? user.fetchedData.userID : user.userID;
  } catch (e) {
    console.log("*******  no id in request *******");
  }

  if (!collection) return res.send({ status: "no", data: "error collection given" });

  const idStrring = (await collection) == "Users" ? "_id" : "userID";
  console.log({ userID });
  console.log({ idStrring });
  searchParams[idStrring] = userID;
  console.log({ userID });
  let searchResult = await Helper.getData(collection, searchParams);
  return res.send(searchResult);
});

HArouter.post("/api/handleLogin", async (req, res) => {
  let searchParams = await req.body;
  let searchResult = await Helper.getData("Users", searchParams);

  if (searchResult.status == "no") return res.send({ ststus: "no", data: "no record in data base" });
  else
    await Config.findOne({ userID: searchResult.data[0]._id })

      .then((configData) => {
        console.log({ configData });
        return res.send({
          status: "yes",
          configObj: configData ? configData : "NO CONFIG OBJECT",
          userID: searchResult.data[0]._id,
        });
      })
      .catch((err) => res.send({ status: "no", data: err }));
});

HArouter.post("/api/deleteData", Helper.authenticateToken, async (req, res) => {
  const user = await req.user;
  const userID = await Helper.extractUserId(req);

  // console.log("after \n", { searchParams });
  console.log({ user });

  let { collection, indentifierValue, indentifier } = await req.body;

  let searchResult = await Helper.deleteByParames(userID, collection, indentifier, indentifierValue).catch((err) =>
    res.send({ status: "no", data: err })
  );

  if (searchResult.status == "no") return res.send({ ststus: "no", data: "no record in data base" });
  else
    return res.send({
      status: "yes",

      userID: searchResult,
    });
});
HArouter.post("/api/setConfig", Helper.authenticateToken, async (req, res) => {
  const actionHeader = req.headers["forcedaction"];
  const configObj = await req.body;
  const validate_data = await Validator.VALIDATE_REQUEST_INPUT(configObj, 0);
  const user = await req.user;
  console.log({ user });
  let userID;

  try {
    userID = user.fetchedData?.userID ? user.fetchedData.userID : user.userID;
  } catch (e) {
    return res.send('"*******  no id in request *******"');
  }

  if (validate_data.status == false) return res.send({ status: "no", data: validate_data });

  configObj.userID = userID;
  Helper.setConfig(configObj, "Config", actionHeader)
    .then((searchResult) => {
      console.log({ searchResult });
      return res.send(searchResult);
    })
    .catch((e) => res.send(e));
});

HArouter.post("/api/saveDocs", Helper.authenticateToken, async (req, res) => {
  const docsArrey = await req.body;
  console.log("************** /API/saveDocs **********\n ", { docsArrey });

  if (!Array.isArray(docsArrey)) return res.send({ status: no, result: "not an array" });
  const isBiggerThenOne = docsArrey.length > 1;

  const data = new DocData(docsArrey[0]);
  console.log({ data });

  isBiggerThenOne
    ? DocData.insertMany(docsArrey)
        .then((result) => {
          console.log(result);
          res.send({ status: "yes", data: result });
        })
        .catch((e) => {
          console.log(e);
          res.send({ status: "no", data: e });
        })
    : data
        .save()
        .then((result) => {
          console.log("!!!!!!!!!! result !!!!!!!!!!!", result);
          res.send({ status: "yes", data: result });
        })
        .catch((e) => {
          console.log(e);
          res.send({ status: "no", data: e });
        });
});

HArouter.post("/api/saveDocs222", Helper.authenticateToken, async (req, res) => {
  const docsArrey = await req.body;
  console.log("************** /API/saveDocs **********\n ", { docsArrey });

  if (!Array.isArray(docsArrey)) return res.send({ status: no, result: "not an array" });
  const isBiggerThenOne = docsArrey.length > 1;

  const data = new DocData(docsArrey[0]);
  console.log({ data });

  isBiggerThenOne
    ? DocData.insertMany(docsArrey)
        .then((result) => {
          console.log(result);
          res.send({ status: "yes", data: result });
        })
        .catch((e) => {
          console.log(e);
          res.send({ status: "no", data: e });
        })
    : data
        .save()
        .then((result) => {
          console.log("!!!!!!!!!! result !!!!!!!!!!!", result);
          res.send({ status: "yes", data: result });
        })
        .catch((e) => {
          console.log(e);
          res.send({ status: "no", data: e });
        });
});

HArouter.post("/api/storeTempUrls", Helper.authenticateToken, async (req, res) => {
  let userID;
  try {
    userID = (await req.user.fetchedData.userID) ? req.user.fetchedData.userID : req.user.userID;
  } catch (e) {
    console.log("*******  no id in request *******");
  }

  //if(!userID) return res.send({ status: "no", data:'no user id' });

  DocData.find({ userID: userID })
    .exec()
    .then((result) => {
      // console.log(result);
      res.send({ status: "yes", data: result });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: "no", data: e });
    });
});

module.exports = HArouter;
