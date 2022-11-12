const { async } = require("@firebase/util");
const Validator = require("./validator");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const { Config, MtxLog, DocData, Users, ErpConfig, BiRows } = require("../DBs/dbObjects/matrix_Ui_Schemas");

const list_of_tables = ["Users", "Config", "ErpConfig", "MtxLog", "BiRows"];
const column_name_list = ["_id", "userID", "userID", "userID"];
const mockConfig = {
  usserID: { type: String, required: true },
  ModulsPremission: {
    Messages: {
      whatsApp: {
        isOpend: true,
        remainingSum: 100,
      },
    },
  },
  Reports: {
    DefaultReports: {
      castumers: { "קוד מיון": 300 },
      products: { מחסן: 1 },
    },
  },
  DefaultDriver: {
    isDefault: false,
    //   AccountKey: Number,
    //      isFirst: Boolean,
  },
  DocumentDef: {
    isDefault: true,
    DocumentDef: 1,
    isFirst: false,
  },
  PremissionMtx: {
    docLimit: { isLimited: true, Amount: 50 },

    sumLimit: { isLimited: true, Amount: 20000 },
    taxDocs: true,
    Refund: { isAllow: false, isLimited: Boolean, Amount: Number },
    Discount: { isAllow: true, isLimited: false, Amount: Number },
    ObligoPass: { isAllow: false },
    FlagedCastumers: { isAllow: false },
  },
};

const extractUserId = async (req) => {
  let user = await req.user;
  console.log({ user });
  let userID;
  try {
    userID = user?.fetchedData?.userID ? user.fetchedData.userID : user.userID;
  } catch (e) {
    console.log(e);
    userID = null;
  }
  return userID;
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token == null) {
    req.testMsg = {
      status: 401,
      msg: "***** in test mode ***** no token in header",
    };
    next();
    return;
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      req.testMsg = {
        status: 403,
        msg: "***** in test mode ***** no token in header",
      };
      console.log(user);
      next();
      return;
    }
    req.testMsg = { status: 200 };
    req.user = user;
    console.log("user@@@@@@@@", user);
    next();
  });
};

const getData = async (collection, searchParams) => {
  console.log("in get data !!!!", { collection, searchParams });

  const tableName = await eval(collection);
  return tableName
    .find(searchParams)
    .then((result) => {
      console.log({ result });
      return { status: result.length > 0 ? "yes" : "no", data: result };
    })
    .catch((e) => {
      console.log(e);
      return { status: "no", data: e };
    });
};

const saveRecord = async (NEW_RECORD_DATA, id, tableName, action) => {
  console.log("********** saveConfig **********");
  let NEW_RECORD = new tableName(NEW_RECORD_DATA);

  return NEW_RECORD.save()
    .then((result) => {
      console.log("result in save !!!!", result);
      return { status: "yes", action: action, data: result };
    })
    .catch((e) => {
      console.log(e);
      return { status: "no", action: action, data: e };
    });
};

const updateRecord = async (NEW_RECORD_DATA_a, reportData, tableName, action) => {
  console.log("************** update config **************");
  // consol.log("new record data \n", NEW_RECORD_DATA);
  console.table({ reportData });
  const NEW_RECORD_DATA = await NEW_RECORD_DATA_a;
  console.log({ NEW_RECORD_DATA });
  return await tableName
    .updateOne(
      { userID: reportData.data.userID },
      {
        $set: NEW_RECORD_DATA,
      }
    )
    .then((UPDATED_DATA) => {
      console.log({ UPDATED_DATA });
      return { status: "yes", data: UPDATED_DATA };
    })
    .catch((error) => {
      console.log({ error });
      return { status: "no", data: erro };
    });
};

const deleteByParames = async (userID, collection, identifier, identifierValue) => {
  const Table = eval(collection);
  //const ColoumnName = eval(identifier)
  return await Table.findOneAndRemove({
    userID: userID,
    [identifier]: identifierValue,
  })
    .then((result) => {
      console.log({ result });
      return { status: result ? "yes" : "no record in db", data: result };
    })
    .catch((e) => {
      console.log(e);
      return { status: "no", data: e };
    });
};

const deleteRecord = async (NEW_RECORD_DATA, userData, table, action) => {
  console.log("************** delete config **************");
  let tableName = table == 4 ? eval(list_of_tables[table]) : table;
  console.log("table name $$$$$$$$$$$$$$$", tableName);
  return await tableName
    .findOneAndRemove({ _id: userData.id })
    .then((result) => {
      console.log(result);
      return { status: "yes", action: action, data: result };
    })
    .catch((e) => {
      console.log(e);
      return { status: "no", action: action, data: e };
    });
};

const setConfig = async (userData, numOfTable, forceAction) => {
  console.log("action header in set config ", forceAction);
  const action_to_function_hash = {
    update: updateRecord,
    save: saveRecord,
    delete: deleteRecord,
  };

  const tableName = eval(list_of_tables[numOfTable]);
  const NEW_RECORD_DATA = userData;
  const VALIDATE_ACTION = await Validator.VALIDATE_REQUEST_INPUT(userData, 1);
  const action = forceAction != "null" ? forceAction : VALIDATE_ACTION.action;

  return await eval(action_to_function_hash[action])(NEW_RECORD_DATA, VALIDATE_ACTION, tableName, action);
};
module.exports.deleteRecord = deleteRecord;
module.exports.setConfig = setConfig;
module.exports.getData = getData;
module.exports.mockConfig = mockConfig;
module.exports.authenticateToken = authenticateToken;
module.exports.extractUserId = extractUserId;
module.exports.deleteByParames = deleteByParames;
// function hashUserKey(key) {
//   const keysLocation = { MtxLog: "matrixID", Users: "userPassword" };
//   let hashedKey = crypto.createHash("md5").update(key).digest("hex");
//   if (collection) {
//     let Exist = await[collection].findOne({
//       [keysLocation[collection]]: hashedKey,
//     });
//     if (Exist) hashUserKey();
//     else return { hashedKey: hashedKey, Key: key };
//   } else return { hashedKey: hashedKey, Key: key };
// }

// function generateKey() {
//   return crypto.randomBytes(32).toString("hex");
// }
