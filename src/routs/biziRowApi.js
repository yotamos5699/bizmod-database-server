"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bizi_row_1 = require("../DBs/dbObjects/bizi_row");
const cors_1 = __importDefault(require("cors"));
const RowRouter = express_1.default.Router();
RowRouter.use((0, cors_1.default)({
    origin: "*",
}));
// type BiziRowConfig = typeof
const validateBody = (body) => {
    return true;
};
const checkIfChanges = (object, body) => {
    isExistObj: ["Date", "userID", "headersConfig", "createdAt", "updatedAt", "__v"];
    delete object._id;
    delete object.__v;
    delete object.updatedAt;
    delete object.createdAt;
};
RowRouter.post("/bizi_row/set_config", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in set config", req.body);
    const Body = yield req.body;
    const userID = Body.userID;
    const searchData = yield bizi_row_1.BiziRowConfig.find({ userID: userID });
    if (searchData.length == 0) {
        new bizi_row_1.BiziRowConfig(Body)
            .save()
            .then((result) => {
            console.log("***************************** saving row config data !!!! ******************************");
            res.send({ status: true, data: result });
        })
            .catch((e) => {
            console.log(e);
            res.send({ status: "no", data: e });
        });
    }
    else {
        delete Body.userID;
        bizi_row_1.BiziRowConfig.updateOne({ userID: userID }, {
            $set: Object.assign(Object.assign({}, Body), { id: searchData[0]._id }),
        })
            .then((result) => {
            console.log("***************************** updating matrix data !!!! ******************************");
            console.log({ result });
            res.send({ status: false, data: result });
        })
            .catch((e) => {
            res.send({ status: false, data: e });
        });
    }
}));
RowRouter.post("/bizi_row/get_config", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in get config ", req.body);
    const { userID } = yield req.body;
    const isExist = yield bizi_row_1.BiziRowConfig.findOne({ userID: userID });
    if (!isExist)
        return res.send({ status: false, data: "אין הגדרות בדאטה בייס" });
    return res.send({ status: true, data: isExist });
}));
RowRouter.post("/bizi_row/del_config", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in get config ", req.body);
    const { userID } = yield req.body;
    const isExist = yield bizi_row_1.BiziRowConfig.findOneAndRemove({ userID: userID });
    if (!isExist)
        return res.send({ status: false, data: "אין הגדרות בדאטה בייס" });
    return res.send({ status: true, data: isExist });
}));
module.exports = RowRouter;
