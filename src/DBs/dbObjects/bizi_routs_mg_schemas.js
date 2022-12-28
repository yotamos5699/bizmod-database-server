"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
//import uniqueValidator from "mongoose-unique-validator"
const Schema = mongoose_1.default.Schema;
// דוא&quot;ל מס&quot;ב ומכתבים
// :
// "info@gatavigdor.co.il"
// דואר אלקטרוני
// :
// "info@gatavigdor.co.il"
// טלפון נייד
// :
// "523640654"
// יתרת חשבון
// :
// -300
// כתובת
// :
// "מורדי הגטאות 91"
// מפתח
// :
// "6025"
// עיר
// :
// "ראשון לציון"
// פקס
// :
// null
// קוד מיון
// :
// 300
// שם חשבון
// :
// "תנובת השדה"
const castumer = new Schema({
    key: String,
    address: String,
    cords: {
        lat: Number,
        lan: Number,
    },
});
const client = new Schema({
    userID: String,
    isUpdated: Boolean,
    castumers: [castumer],
});
const rout = new Schema({
    userID: String,
    driverID: String,
    routVersions: [[Object]],
});
const Rout = mongoose_1.default.model("Rout", rout);
const Client = mongoose_1.default.model("Client", client);
module.exports.Rout = Rout;
module.exports.Client = Client;
