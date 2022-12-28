import mongoose from "mongoose";
import { string } from "zod";
//import uniqueValidator from "mongoose-unique-validator"
const Schema = mongoose.Schema;

// ValueDate: Date,
// DocumentDefID: Number,
// StockID: Number,
// DocNumber: Number,
// AccountKey: String,
// Accountname: String,
// TotalCost: Number,
// Address: String,
// DocumentDetails: String,
// isStored: { type: Boolean, default: false },
// DocUrl: String,
// Action: Number,
// SigStat: SigningStat,

export const files = new Schema({
  relatedfileID: String,
  userID: { type: String, required: true },
  AccountKey: { type: String, required: true },
  file: { type: Buffer, required: true },
  state: { type: String, required: true },
  castumer: {
    DocumentDefID: Number,
    DocNumber: Number,
    Accountname: String,
    TotalCost: Number,
    ValueDate: Date,
  },
});
export const Files = mongoose.model("Files", files);
//dule.exports.Files = Files;
