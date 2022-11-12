const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const deliveryZones = new Schema(
  {
    userID: String,
    zoneName: String,
    ID: String,
    Report: Object,
  },
  { timestamps: true, strict: true, strictQuery: false }
);

const locationData = new Schema(
  {
    address: String,
    geoLocation: {
      lat: mongoose.Types.Decimal128,
      lan: mongoose.Types.Decimal128,
    },
    ID: String,
    Report: Object,
  },
  { timestamps: true, strict: true, strictQuery: false }
);

const routs = new Schema(
  {
    usserID: String,
    routID: String,
    locationArray: [locationData],
  },
  { timestamps: true, strict: true, strictQuery: false }
);

const DeliveryZones = mongoose.model("DeliveryZones", deliveryZones);

module.exports.DeliveryZones = DeliveryZones;
