const express = require("express");
const MGrouter = express.Router();
const mongoose = require("mongoose");
const Validator = require("./validator");
const cors = require("cors");
app.use(
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
  console.log("body in save matrix !!!", body);
  const { matrixID, userID, matrixesData } = body;

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

  let reqMtxData = {
    Date: body.Date ? body.Date : new Date(),
    matrixName: body.martixName ? body.martixName : matrixID,
    matrixID: matrixID,
    userID: userID,
    isBI: body.isBI ? body.isBI : false,
    matrixesData: JSON.stringify(
      pulledMatrixData ? pulledMatrixData : matrixesData
    ),
  };

  const searchData = await MtxLog.find({ matrixID: matrixID });
  console.log(searchData);
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
          $set: { ...reqMtxData, id: searchData[0]._id },
        }
      )
        .then((result) => {
          console.log(
            "***************************** updating matrix data !!!! ******************************"
          );
          console.log(result);
          res.send({ status: "yes", data: result });
        })
        .catch((e) => {
          console.log(e);
          res.send({ status: "no", data: e });
        });

  if (reqMtxData.isBI) saveDataForBi(reqMtxData);
});

const saveDataForBi = (reqMtxData) => {
  let biData = [];
  let dataRow = {};
  let data = JSON.parse(reqMtxData.matrixesData);

  console.log("data !!!! ", data);
  data.mainMatrix.cellsData.forEach((row, rowIndex) => {
    row.forEach((cell) => {
      console.log("cell ", cell);
      dataRow = {
        Date: reqMtxData.Date,
        AccountKey: data.mainMatrix.AccountKey[rowIndex],
        DocumentID: data.mainMatrix.DocumentID[rowIndex],
        itemKey: data.mainMatrix.itemsHeaders[rowIndex],
        Quantity: cell,
      };
      biData.push(dataRow);
      dataRow = {};
    });
  });

  console.log("bi before send ", biData);

  let rows = new BiRows(biData);

  biData.length > 1
    ? BiRows.insertMany(biData)
        .then((result) => {
          console.log("BiData !!!!!!!", result);
          return { status: "yes", data: result };
        })
        .catch((e) => {
          console.log(e);
          return { status: "no", data: e };
        })
    : rows
        .save()
        .then((result) => {
          console.log("!!!!!!!!!! result !!!!!!!!!!!", result);
          return { status: "yes", data: result };
        })
        .catch((e) => {
          console.log(e);
          return { status: "no", data: e };
        });
};

MGrouter.post(
  "/api/loadDocUrls",
  Helper.authenticateToken,
  async (req, res) => {
    let userID;

    try {
      userID = await req.user.fetchedData.userID;
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

MGrouter.post("/api/deleteData", async (req, res) => {
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
MGrouter.post("/api/setConfig", async (req, res) => {
  const actionHeader = req.headers["forcedaction"];
  console.log("************** action header ********** ", actionHeader);

  let configObj = await req.body;
  // console.log(configObj);
  let validate_data = await Validator.VALIDATE_REQUEST_INPUT(configObj, 0);
  console.log(validate_data.status);

  if (validate_data.status == false)
    return res.send({ status: "no", data: validate_data });

  Helper.setConfig(configObj, 1, actionHeader)
    .then((searchResult) => {
      console.log("searchResult in setConfig ~~~~ ", searchResult);
      return res.send(searchResult);
    })
    .catch((e) => res.send(e));
});

MGrouter.post("/api/setErpConfig", async (req, res) => {
  const actionHeader = req.headers["forcedaction"];
  console.log("************** action header ********** ", req.headers);

  let configObj = await req.body;
  console.log(configObj);
  let validate_data = await Validator.VALIDATE_REQUEST_INPUT(configObj, 0);
  console.log("after validetion ###", validate_data);
  if (!validate_data.status)
    return res.send({ status: "no", data: validate_data.data });

  Helper.setConfig(configObj, 1, actionHeader)
    .then((searchResult) => {
      console.log("searchResult in setConfig ~~~~ ", searchResult);
      return res.send(searchResult);
    })
    .catch((e) => res.send(e));
});

MGrouter.post("/api/saveDocs", Helper.authenticateToken, async (req, res) => {
  const docsArrey = await req.body;
  console.log("************** doc arrey to db ********** ", docsArrey);

  const functionHash = { true: "insertMany", false: "save" };
  if (!Array.isArray(docsArrey))
    return res.send({ status: no, result: "not an array" });
  const isBiggerThenOne = docsArrey.length > 1;
  const data = new DocData(docsArrey[0]);
  console.log("$$$$$$$$$$$$$ data $$$$$$$$$$$$", data);
  //const selectedFunction = eval(functionHash[isBiggerThenOne]);
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

module.exports = MGrouter;
