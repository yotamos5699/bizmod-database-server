const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { string, boolean } = require("zod");
const Schema = mongoose.Schema;
const tempKey =
  "23e54b4b3e541261140bdeb257538ba11c5104620e61217d5d6735a3c9361a5aac67a7f85278e4e53f3008598d8927f68e89e3e16147c194f96976bdf3075d55";
// ********************************    MATRIX LOGS       ********************************//

const tempDbName = "wizdb2394n5";
const tempServer = "lb11.wizcloud.co.il";

const Doc = new Schema(
  {
    id: string,
    ownerID: String,
    type: { type: String, required: true },
    signatureStatus: {
      isStored: Boolean,
      isSign: Boolean,
      upadatedUrl: string,
    },
  },
  {
    timestamps: true,
  }
);

const Measurement = new Schema(
  {
    userID: { type: String, required: true },
    doc: Doc,
  },
  {
    timestamps: true,
  }
);
const Unit = new Schema(
  {
    userID: { type: String, required: true },
    measurements: [Measurement],
    isParent: Boolean,
  },
  {
    timestamps: true,
  }
);

const Worker_ = new Schema({
  id: { type: string, unique: Boolean },
  PermissionsToken: String,
});

const Project = new Schema(
  {
    id: { type: String, unique: true },
    stuff: [Worker_],
    isOpen: Boolean,
    date: Number,
    parentId: String,
    Units: [Unit],
    docsUrls: [Doc],
    isProduced: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);
Project.plugin(uniqueValidator);
//******************************** SIGNETURE PROCESS  *********************************************/

const Asset_ = mongoose.model("Asset", Project);

module.exports.Asset_ = Asset_;
