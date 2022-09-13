const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ********************************    MATRIX LOGS       ********************************//

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
    matrixName: String,
    userID: { type: String, required: true },
    matrixesData: String,
    matrixesUiData: String,
    isBI: Boolean,
    counter: { type: Number, default: 0 },
    innerLog: [innerLog],
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

//******************************** SIGNETURE PROCESS  *********************************************/
const SigningStat = new Schema(
  {
    storedDocUrl: String,
    signDocUrl: String,
    isSigned: Boolean,
  },
  {
    timestamps: true,
  }
);

const docsData = new Schema(
  {
    userID: { type: String, required: true },
    DocumentIssuedStatus: String,
    ValueDate: String,
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

//********************************************* PLANS **************************************/
const matrixAI = new Schema({
  isMatrix: { type: Boolean, required: true },
});
const driveAI = new Schema({
  isDriveAI: { type: Boolean, required: true },
});

const clockAI = new Schema({
  isClockAi: { type: Boolean, required: true },
});

const signAI = new Schema({
  isSignAI: { type: Boolean, required: true },
});

const plans = new Schema(
  {
    planID: String,
    adminID: String,
    MatrixAI: matrixAI,
    DriveAI: driveAI,
    ClockAI: clockAI,
    SignAI: signAI,
    Mail: { type: String, required: true },
    PlanKey: String,
    subPremissions: {},
  },
  { timestamps: true }
);

// ******************************************* Keys and enteries ***********************************//
//
const enteri = new Schema(
  {
    MetaData: String,
    userID: { type: String },
  },
  { timestamps: true }
);

const keys = new Schema(
  {
    ProcessID: String,
    isAdmin: { type: Boolean, required: true },
    adminID: String,
    HashedUserKey: { type: String, required: true },
    userID: { type: String, required: true },
    LogedEntries: [enteri],
  },
  { timestamps: true }
);

//************************************** Config ^*************************************//
/*          FOR NEW USERS IN TRIELS AND SUB ADMIN USER FOR PAYED PLAN                 */
/*          VIA IF <USER PLAN> != TRIEL      */

const erpConfig = new Schema(
  {
    erpName: { type: String, required: true },
    userID: { type: String, required: true },
    CompanyKey: String,
    CompanyServer: String,
    CompanyDbName: String,
    CompanyPassword: String,
    CompanyUserName: String,
    CompanyNumber: String,
  },
  { timestamps: true, strict: true, strictQuery: false }
);
const driver = new Schema({
  isDefault: { type: Boolean, default: false },
  AccountKey: Number,
  isFirst: Boolean,
});
const docDef = new Schema({
  isDefault: { type: Boolean, default: false },
  DocumentDef: String,
  isFirst: Boolean,
});
const pMtx = new Schema({
  docLimit: { isLimited: Boolean, Amount: Number },

  sumLimit: { isLimited: Boolean, Amount: Number },
  taxDocs: Boolean,
  Refund: { isAllow: Boolean, isLimited: Boolean, Amount: Number },
  Discount: { isAllow: Boolean, isLimited: Boolean, Amount: Number },
  ObligoPass: { isAllow: Boolean },
  FlagedCastumers: { isAllow: Boolean },
});
const config = new Schema(
  {
    userID: { type: String, required: true },
    AccountState: String,
    DefaultDriver: driver,
    DocumentDef: docDef,
    PremissionMtx: pMtx,
    ErpConfig: erpConfig,
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
const Plans = mongoose.model("Plans", plans);
const BiRows = mongoose.model("BiRows", biRows);
//const Keys = mongoose.model("Plans", keys);
const Config = mongoose.model("Config", config);
const ErpConfig = mongoose.model("ErpCofig", erpConfig);

module.exports.BiRows = BiRows;
module.exports.DocData = DocData;
module.exports.MtxLog = MtxLog;
module.exports.Users = Users;
module.exports.Plans = Plans;
module.exports.StoredReports = StoredReports;
module.exports.Config = Config;
module.exports.ErpConfig = ErpConfig;
