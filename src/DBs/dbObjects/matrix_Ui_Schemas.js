const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;
const tempKey =
  "23e54b4b3e541261140bdeb257538ba11c5104620e61217d5d6735a3c9361a5aac67a7f85278e4e53f3008598d8927f68e89e3e16147c194f96976bdf3075d55";
// ********************************    MATRIX LOGS       ********************************//
const tempDbName = "wizdb2394n5";
const tempServer = "lb11.wizcloud.co.il";

const innerLog_ = {
  userID: { type: String, required: true },
};

const innerLog = new Schema(
  { ...innerLog_ },
  {
    timestamps: true,
  }
);
const matrixesData_ = {
  Date: Date,
  matrixID: String,
  matrixName: { type: String, unique: true },
  userID: { type: String, required: true },
  matrixesData: Object,
  matrixesUiData: String,
  isBI: { type: Boolean, default: false },
  isProduced: { type: Boolean, default: false },
  isInitiated: { type: Boolean, default: false },
  counter: { type: Number, default: 0 },
  innerLog: [innerLog],
};
const matrixesData = new Schema(
  { ...matrixesData_ },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);
matrixesData.plugin(uniqueValidator);
//******************************** SIGNETURE PROCESS  *********************************************/

const SigningStat_ = {
  storedDocUrl: String,
  signedDocUrl: String,
  isSigned: Boolean,
};
const SigningStat = new Schema(
  { ...SigningStat_ },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);
const docsData_ = {
  userID: { type: String, required: true },
  DocumentIssuedStatus: String,
  ValueDate: Date,
  DocumentDefID: Number,
  StockID: Number,
  DocNumber: Number,
  AccountKey: String,
  Accountname: String,
  TotalCost: Number,
  Address: String,
  DocumentDetails: String,
  isStored: { type: Boolean, default: false },
  DocUrl: String,
  Action: Number,
  SigStat: SigningStat,
};
const docsData = new Schema({ ...docsData_ }, { timestamps: true, strict: true, strictQuery: false });

const biRows = new Schema(
  {
    userID: { type: String, required: true },
    Date: Date,
    AccountKey: String,
    DocumentID: Number,
    itemKey: String,
    itemName: String,
    Quantity: Number,
  },
  { timestamps: true, strict: true, strictQuery: false }
);
// ************************************* users Schema ******************************** ////
const UserData_ = {
  CompenyName: String,
  CompanyUTR: String,
};
const UserData = new Schema({ UserData_ });

//Account
const users_ = {
  FirstName: String,
  LastName: String,
  Phone: String,
  Mail: { type: String, required: true },
  PlanKey: String,
  userPassword: { type: String, required: true },
  Accountname: String,
  isAdmin: { type: Boolean, required: true, default: true },
  AdminUserID: String,
  isAuthenticated: { type: Boolean, default: false },
  otherDetails: UserData,
};
const users = new Schema({ ...users_ }, { timestamps: true, strict: true, strictQuery: false });

//************************************** Config ^*************************************//
/*          FOR NEW USERS IN TRIELS AND SUB ADMIN USER FOR PAYED PLAN                 */
/*          VIA IF <USER PLAN> != TRIEL      */
const config_ = {
  userID: { type: String, required: true },
  AccountState: String,
  ModulsPremission: {
    BiziRoutes: {
      isAllow: Boolean,
      pivotType: String,
      mtxPreferences: {
        isDefault: { type: Boolean, default: false },
        pivotKey: Number,
      },
    },
    Messages: {
      whatsApp: {
        isAllow: Boolean,
        remainingSum: Number,
      },
    },
  },

  mtxConfig: {
    documentDef: { isDefault: { type: Boolean, default: false }, DocumentNumber: String },
    docLimit: { isLimited: Boolean, Amount: Number },
    sumLimit: { isLimited: Boolean, Amount: Number },
    taxDocs: {
      isAllow: Boolean,
      Refund: {
        isAllow: {
          type: Boolean,
          default: true,
        },
        isLimited: {
          type: Boolean,
          default: false,
        },

        Amount: Number,
      },
      Discount: { isAllow: Boolean, isLimited: Boolean, Amount: Number },
      ObligoPass: { isAllow: Boolean },
    },
  },

  Reports: {
    defaultReports: {
      castumers: {
        sortingKey: { type: String, default: "קוד מיון" },
        sortingValue: { type: String, default: "300" },
      },
      products: { sortingKey: { type: String, default: "מחסן" }, sortingValue: { type: String, default: "1" } },
    },
  },
  ErpConfig: {
    erpName: { type: String, default: "HA" | "RI", required: true },
    CompanyKey: { type: String, default: tempKey },
    CompanyServer: { type: String, default: tempServer },
    CompanyDbName: { type: String, default: tempDbName },
    CompanyPassword: String,
    CompanyUserName: String,
    CompanyNumber: String,
  },
};
const config = new Schema({ ...config_ }, { timestamps: true, strict: true, strictQuery: false });

// validate name
// validate userID

// **********************************************************************************/
const storedReports = new mongoose.Schema(
  {
    userID: String,
    Date: Date,
    ID: String,
    Report: Object,
  },
  { timestamps: true, strict: true, strictQuery: false }
);
const schemass = [
  { name: "DocData", data: docsData_, subschema: "SigningStat_" },
  { name: "MtxLog", data: matrixesData_, subschema: "innerLog_" },
  { name: "Users", data: users_, subschema: "UserData_" },
  { name: "Config", data: "config_" },
];
const StoredReports = mongoose.model("StoredReports", storedReports);
const DocData = mongoose.model("DocDataLog", docsData);
const MtxLog = mongoose.model("MtxLog", matrixesData);
const Users = mongoose.model("Users", users);
//const Plans = mongoose.model("Plans", plans);
const BiRows = mongoose.model("BiRows", biRows);
//const Keys = mongoose.model("Plans", keys);
const Config = mongoose.model("Config", config);
//const ErpConfig = mongoose.model("ErpCofig", erpConfig);
module.exports.schemass = schemass;
module.exports.BiRows = BiRows;
module.exports.DocData = DocData;
module.exports.MtxLog = MtxLog;
module.exports.Users = Users;
//module.exports.Plans = Plans;
module.exports.StoredReports = StoredReports;
module.exports.Config = Config;
//module.exports.ErpConfig = ErpConfig;
