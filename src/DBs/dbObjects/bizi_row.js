"use strict";

const { boolean, string } = require("zod");

// import { number } from "zod";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiziRowConfig = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// const uniqueValidator = require("mongoose-unique-validator");
// const { string } = require("zod");
const Schema = mongoose_1.default.Schema;
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
        toShow: { type: Boolean, default: true },
        colID: { type: String, required: true },
        position: { type: String, required: true },
        config: String,
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
exports.BiziRowConfig = mongoose_1.default.model("BiziRowConfig", biziRowConfig);
