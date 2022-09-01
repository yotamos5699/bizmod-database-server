const { async } = require("@firebase/util");
const Validator = require("./validator");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const {
  Config,
  MtxLog,
  DocData,
  Users,
  ErpConfig,
} = require("../DBs/dbObjects/MGschemas");

const list_of_tables = ["Users", "Config", "ErpConfig", "MtxLog"];
const column_name_list = ["_id", "userID", "userID", "userID"];
const mockConfig = {
  usserID: { type: String, required: true },
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

  return eval(collection)
    .find(searchParams)
    .then((result) => {
      return { status: result.length > 0 ? "yes" : "no", data: result };
    })
    .catch((e) => {
      console.log(e);
      return { status: "no", data: e };
    });
};

const saveRecord = async (NEW_RECORD_DATA, id, tableName, action) => {
  console.log("********** saveConfig **********");
  return NEW_RECORD_DATA.save()
    .then((result) => {
      console.log("result in save !!!!", result);
      return { status: "yes", action: action, data: result };
    })
    .catch((e) => {
      console.log(e);
      return { status: "no", action: action, data: e };
    });
};

const updateRecord = async (NEW_RECORD_DATA, id, tableName, action) => {
  console.log("************** update config **************");
  let result;
  try {
    await deleteRecord(NEW_RECORD_DATA, id, tableName, action);
    result = await saveRecord(NEW_RECORD_DATA, id, tableName, action);
  } catch (e) {
    console.log(e);
    return { status: "no", data: e };
  }
  return { status: "yes", action: action, data: result };
};

const deleteRecord = async (NEW_RECORD_DATA, id, tableName, action) => {
  console.log("************** delete config **************");
  return tableName
    .findOneAndRemove({ _id: id })
    .then((result) => {
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
  const NEW_RECORD_DATA = new tableName(userData);
  const VALIDATE_ACTION = await Validator.VALIDATE_REQUEST_INPUT(userData, 1);
  console.log(VALIDATE_ACTION.action);
  console.log("force action ", forceAction);
  let action = forceAction != "null" ? forceAction : VALIDATE_ACTION.action;
  console.log("action ,ssss", action);
  return await eval(action_to_function_hash[action])(
    NEW_RECORD_DATA,
    VALIDATE_ACTION.id,
    tableName,
    action
  );
};

module.exports.setConfig = setConfig;
module.exports.getData = getData;
module.exports.mockConfig = mockConfig;
module.exports.authenticateToken = authenticateToken;
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
