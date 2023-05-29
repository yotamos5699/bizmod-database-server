const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { string, boolean } = require("zod");
const Schema = mongoose.Schema;
const tempKey =
  "23e54b4b3e541261140bdeb257538ba11c5104620e61217d5d6735a3c9361a5aac67a7f85278e4e53f3008598d8927f68e89e3e16147c194f96976bdf3075d55";
// ********************************    MATRIX LOGS       ********************************//

const tempDbName = "wizdb2394n5";
const tempServer = "lb11.wizcloud.co.il";

const innerLog = new Schema(
  {
    userID: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const matrixesData = new Schema(
  {
    Date: Date,
    matrixID: String,
    matrixName: { type: String, unique: true },
    userID: { type: String, required: true },
    matrixesData: Object,
    matrixesUiData: String,
    isBI: { type: Boolean, default: false },
    isDrivers: { type: Boolean, default: false },
    isProduced: { type: Boolean, default: false },
    isInitiated: { type: Boolean, default: false },
    counter: { type: Number, default: 0 },
    innerLog: [innerLog],
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);
matrixesData.plugin(uniqueValidator);
//******************************** SIGNETURE PROCESS  *********************************************/

const SigningStat = new Schema(
  {
    storedDocUrl: String,
    signedDocUrl: String,
    isSigned: Boolean,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

const docsData = new Schema(
  {
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
  },
  { timestamps: true, strict: true, strictQuery: false }
);

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

const UserData = new Schema({
  CompenyName: String,
  CompanyUTR: String,
});

//Account

const users = new Schema(
  {
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
  },
  { timestamps: true, strict: true, strictQuery: false }
);

//************************************** Config ^*************************************//
/*          FOR NEW USERS IN TRIELS AND SUB ADMIN USER FOR PAYED PLAN                 */
/*          VIA IF <USER PLAN> != TRIEL      */

const config = new Schema(
  {
    userID: { type: String, required: true },
    AccountState: String,
    ModulsPremission: {
      BiziRoutes: {
        isAllow: Boolean,
        pivotType: "driver" | "zone",
        mtxPreferences: {
          isDefault: { type: Boolean, default: false },
          pivotKey: Number | String,
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
      documentDefault: { isDefault: { type: Boolean, default: false }, Document: String },
      actionDefault: { isDefault: { type: Boolean, default: false }, Action: String },
      docLimit: { isLimited: Boolean, Amount: Number },
      sumLimit: { isLimited: Boolean, Amount: Number },
      taxDocs: {
        isAllow: Boolean,
        Refund: {
          isAllow: {
            type: Boolean,
            default: true,
          },
          isSumLimited: {
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
        castumers: [
          {
            sortingKey: { type: String, enum: ["sort"] },
            sortingType: { type: String, enum: ["range", "multi", "single"] },
            sortingValue: { type: Array },
          },
        ],
        products: [
          {
            sortingKey: { type: String, enum: ["sort", "storage"] },
            sortingType: { type: String, enum: ["range", "multi", "single"] },
            sortingValue: { type: Array },
          },
        ],
      },
    },
    ErpConfig: {
      erpName: "HA" | "RI",
      HA: {
        usserPrivetKey: { type: String, default: tempKey },
        usserServerName: { type: String, default: tempServer },
        usserDbname: { type: String, default: tempDbName },
      },
      RI: { CompanyPassword: String, CompanyUserName: String, CompanyNumber: String },
    },
  },
  { timestamps: true, strict: true, strictQuery: false }
);

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

const StoredReports = mongoose.model("StoredReports", storedReports);
const DocData = mongoose.model("DocDataLog", docsData);
const MtxLog = mongoose.model("MtxLog", matrixesData);
const Users = mongoose.model("Users", users);
//const Plans = mongoose.model("Plans", plans);
const BiRows = mongoose.model("BiRows", biRows);
//const Keys = mongoose.model("Plans", keys);
const Config = mongoose.model("Config", config);
//const ErpConfig = mongoose.model("ErpCofig", erpConfig);

module.exports.BiRows = BiRows;
module.exports.DocData = DocData;
module.exports.MtxLog = MtxLog;
module.exports.Users = Users;
//module.exports.Plans = Plans;
module.exports.StoredReports = StoredReports;
module.exports.Config = Config;
//module.exports.ErpConfig = ErpConfig;
