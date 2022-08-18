const { async } = require("@firebase/util");
const mongoose = require("mongoose");
const {
  Config,
  MtxLog,
  DocData,
  Users,
} = require("../DBs/dbObjects/MGschemas");

const mockConfig = {
  userID: { type: String, required: true },
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

const getData = async (collection, searchParams) => {
  console.log("in get data !!!!", { collection, searchParams });

  return eval(collection)
    .find(searchParams)
    .then((result) => {
      console.log(result);
      return { status: result.length > 0 ? "yes" : "no", data: result };
    })
    .catch((e) => {
      console.log(e);
      return { status: "no", data: e };
    });
};

const setConfig = async (userData) => {
  let NEW_USER_SETTING = new Config(userData);
  return NEW_USER_SETTING.save()
    .then((result) => {
      return { status: "yes", data: result };
    })
    .catch((e) => {
      console.log(e);
      return { status: "no", data: e };
    });
};

module.exports.setConfig = setConfig;
module.exports.getData = getData;
module.exports.mockConfig = mockConfig;

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