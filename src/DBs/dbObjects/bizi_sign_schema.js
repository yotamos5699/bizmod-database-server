"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Files = exports.files = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
//import uniqueValidator from "mongoose-unique-validator"
const Schema = mongoose_1.default.Schema;
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
exports.files = new Schema({
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
exports.Files = mongoose_1.default.model("Files", exports.files);
//dule.exports.Files = Files;
