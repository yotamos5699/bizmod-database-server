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
    const Body = yield req.body;
    const isExist = yield bizi_row_1.BiziRowConfig.findOne({ userID: Body.userID });
    if (!validateBody(Body))
        return res.send({ status: false, data: "data not ok" });
    if (isExist) {
        // @ts-ignore
        const isExistObj = isExist._doc;
        checkIfChanges(isExist, Body);
        bizi_row_1.BiziRowConfig.updateOne({ userID: Body.userID }, {
            $set: Object.assign(Object.assign({}, Body), { id: isExist._id }),
        });
        return res.send({ status: true, data: "קובץ הגדרות עודכן..." });
    }
    else {
        const data = new bizi_row_1.BiziRowConfig(Body);
        return data
            .save()
            .then((result) => res.send({ status: true, data: result }))
            .catch((err) => res.send({ status: false, data: err }));
    }
}));
RowRouter.post("/bizi_row/get_config", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = yield req.body;
    const isExist = yield bizi_row_1.BiziRowConfig.findOne({ userID: userID });
    if (!isExist)
        return res.send({ status: false, data: "אין הגדרות בדאטה בייס" });
    return res.send({ status: true, data: isExist });
}));
module.exports = RowRouter;
