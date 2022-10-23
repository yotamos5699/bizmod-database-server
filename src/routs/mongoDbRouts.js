/*
--- extract the user id header extraction to a public function 
*/

const express = require("express");
const MGrouter = express.Router();
const mongoose = require("mongoose");
const Validator = require("./validator");
const fbHelper = require("../DBs/fbHelper");
const cors = require("cors");
const utfZone = "en";
MGrouter.use(
  cors({
    origin: "*",
  })
);
const {
  MtxLog,
  DocData,
  Users,
  ErpConfig,
  BiRows,
  StoredReports,
} = require("../DBs/dbObjects/MGschemas");
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
  let id = await req.body.userID;
  let reqAmount = await req.body.amount;
  let amount = reqAmount ? reqAmount : 1;

  console.log("amount ", amount);
  console.table({ id });
  MtxLog.find({ userID: id })
    .sort({ _id: -1 })
    .then((result) => {
      console.log(result);
      console.log("result.length ssss", result.length);
      res.send({
        status: result.length == 0 ? "no" : "yes",
        data: result.splice(0, result.length > amount ? amount : result.length),
      });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: "no", data: e });
    });
});

MGrouter.post("/api/saveMatrix", Helper.authenticateToken, async (req, res) => {
  let body = await req.body;
  console.log(
    "body in save matrix !!!",
    body,
    "\nbody. isproduced\n",
    body.isProduced
  );
  const { matrixID, matrixesData } = body;
  let user = await req.user;
  console.log({ user });
  let userID;
  try {
    userID = user?.fetchedData?.userID ? user.fetchedData.userID : user.userID;
  } catch (e) {
    console.log("*******  no id in request *******");
  }

  console.log(userID);
  let pulledMatrixData = matrixesData?.matrixesData;
  let inDataBase;
  try {
    inDataBase = await Users.find({ _id: userID });
  } catch (e) {
    console.log(e);
    return res.send({ status: "no", data: e });
  }
  if (inDataBase.length == 0)
    return res.send({ status: "no", data: "user id not found" });

  console.log("matrix name LLLLL", body.matrixName);
  let reqMtxData = {
    Date: body.Date
      ? body.Date
      : new Date().toLocaleString(utfZone, { timeZone: "Asia/Jerusalem" }),
    matrixName: body.matrixName ? body.matrixName : matrixID,
    matrixID: matrixID,
    userID: userID,
    isBI: body.isBI ? body.isBI : false,
    isProduced: body.isProduced ? body.isProduced : false,
    isInitiated: body.isInitiated ? body.isInitiated : false,
    matrixesData: pulledMatrixData ? pulledMatrixData : matrixesData,
    matrixesUiData: body.matrixesUiData ? body.matrixesUiData : null,
  };

  console.log({ reqMtxData });
  const searchData = await MtxLog.find({ matrixID: matrixID });
  console.log({ searchData });
  searchData.length == 0
    ? new MtxLog(reqMtxData)
        .save()
        .then((result) => {
          console.log(
            "***************************** saving matrix data !!!! ******************************"
          );
          console.log(result);
          res.send({ status: "yes", data: result });
        })
        .catch((e) => {
          console.log(e);
          res.send({ status: "no", data: e });
        })
    : MtxLog.updateOne(
        { matrixID: matrixID },
        {
          $set: { ...body, id: searchData[0]._id },
        }
      )
        .then((result) => {
          console.log(
            "***************************** updating matrix data !!!! ******************************"
          );
          console.log({ result });
          res.send({ status: "yes", data: result });
        })
        .catch((e) => {
          console.log(e);
          res.send({ status: "no", data: e });
        });
  console.log("is bi :", body.isBI);

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

MGrouter.post(
  "/api/loadDocUrls",
  Helper.authenticateToken,
  async (req, res) => {
    let userID;
    let user = await req.user;

    console.log("user before try $$$$\n");
    try {
      userID = (await user.fetchedData?.userID)
        ? user.fetchedData.userID
        : user.userID;
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
  }
);

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

MGrouter.post("/api/getdata", Helper.authenticateToken, async (req, res) => {
  let { collection, searchParams } = await req.body;
  let userID;
  let user = await req.user;
  console.log("before \n", { searchParams });
  // if (searchParams.Date) searchParams.Date = new Date(searchParams.Date);

  console.log("after \n", { searchParams });
  console.log({ user });

  try {
    userID = user.fetchedData?.userID ? user.fetchedData.userID : user.userID;
  } catch (e) {
    console.log("*******  no id in request *******");
  }

  if (!collection || !searchParams)
    return res.send({ status: "no", data: "error in search params" });

  searchParams.userID = userID;
  console.log({ userID });
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

MGrouter.post("/api/deleteData", Helper.authenticateToken, async (req, res) => {
  let user = await req.user;
  let userID;

  console.log("after \n", { searchParams });
  console.log({ user });

  try {
    userID = user.fetchedData?.userID ? user.fetchedData.userID : user.userID;
  } catch (e) {
    console.log("*******  no id in request *******");
  }

  const TBhash = {
    Users: 0,
    Config: 1,
    ErpConfig: 2,
    MtxLog: 3,
    BiRows: 4,
  };
  let { collection, rowID } = await req.body;
  let searchResult = await Helper.deleteRecord(
    null,
    rowID,
    TBhash[collection],
    null
  );

  if (searchResult.status == "no")
    return res.send({ ststus: "no", data: "no record in data base" });
  else
    return res.send({
      status: "yes",
      // configObj: Helper.mockConfig,
      userID: searchResult,
    });
});
MGrouter.post("/api/setConfig", Helper.authenticateToken, async (req, res) => {
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

  if (validate_data.status == false)
    return res.send({ status: "no", data: validate_data });

  configObj.userID = userID;
  Helper.setConfig(configObj, 1, actionHeader)
    .then((searchResult) => {
      console.log({ searchResult });
      return res.send(searchResult);
    })
    .catch((e) => res.send(e));
});

MGrouter.post(
  "/api/setErpConfig",
  Helper.authenticateToken,
  async (req, res) => {
    let userID;
    const user = await req.user;
    const actionHeader = req.headers["forcedaction"];
    console.log({ user });

    try {
      userID = user.fetchedData?.userID ? user.fetchedData.userID : user.userID;
    } catch (e) {
      console.log("*******  no id in request *******\n", e);
    }

    let configObj = await req.body;
    configObj.userID = userID;

    console.log(configObj);
    let validate_data = await Validator.VALIDATE_REQUEST_INPUT(configObj, 0);

    if (!validate_data.status)
      return res.send({ status: "no", data: validate_data.data });

    Helper.setConfig(configObj, 1, actionHeader)
      .then((searchResult) => {
        console.log("*** setConfig ***\n ", { searchResult });
        return res.send(searchResult);
      })
      .catch((e) => res.send(e));
  }
);

MGrouter.post("/api/saveDocs", Helper.authenticateToken, async (req, res) => {
  const docsArrey = await req.body;
  console.log("************** /API/saveDocs **********\n ", { docsArrey });

  if (!Array.isArray(docsArrey))
    return res.send({ status: no, result: "not an array" });
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

// const SigningStat = new Schema(
//   {
//     storedDocUrl: String,
//     signedDocUrl: String,
//     isSigned: Boolean,
//   },
//   {
//     timestamps: true,
//   }
// );

// const docsData = new Schema(
//   {
//     userID: { type: String, required: true },
//     DocumentIssuedStatus: String,
//     ValueDate: String,
//     DocumentDefID: Number,
//     StockID: Number,
//     DocNumber: Number,
//     AccountKey: String,
//     Accountname: String,
//     TotalCost: Number,
//     Address: String,
//     DocumentDetails: String,
//     isStored: { type: Boolean, default: false },
//     DocUrl: String,
//     Action: Number,
//     SigStat: SigningStat,
//   },
//   { timestamps: true, strict: true, strictQuery: false }
// );

MGrouter.post(
  "/api/storeTempUrls",
  Helper.authenticateToken,
  async (req, res) => {
    let userID;
    try {
      userID = (await req.user.fetchedData.userID)
        ? req.user.fetchedData.userID
        : req.user.userID;
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
  }
);

module.exports = MGrouter;
