// import { number } from "zod";

import mongoose from "mongoose";
// const uniqueValidator = require("mongoose-unique-validator");
// const { string } = require("zod");
const Schema = mongoose.Schema;
// const tempKey =
//   "23e54b4b3e541261140bdeb257538ba11c5104620e61217d5d6735a3c9361a5aac67a7f85278e4e53f3008598d8927f68e89e3e16147c194f96976bdf3075d55";
// // ********************************    MATRIX LOGS       ********************************//

// const tempDbName = "wizdb2394n5";
// const tempServer = "lb11.wizcloud.co.il";

const innerLog = new Schema(
  {
    userID: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const biziRowConfig = new Schema(
  {
    Date: Number,
    userID: { type: String, required: true },
    headersConfig: [
      {
        initialName: String,
        replacmentName: { type: [String, null], default: null },
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);
// biziRowConfig.plugin(uniqueValidator);
//******************************** SIGNETURE PROCESS  *********************************************/

export const BiziRowConfig = mongoose.model("BiziRowConfig", biziRowConfig);
