import mongoose from "mongoose";
//import uniqueValidator from "mongoose-unique-validator"
const Schema = mongoose.Schema;

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

const Rout = mongoose.model("Rout", rout);
const Client = mongoose.model("Client", client);

module.exports.Rout = Rout;
module.exports.Client = Client;
