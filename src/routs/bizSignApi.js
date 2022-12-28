"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const download_1 = __importDefault(require("download"));
const Schemas = __importStar(require("../DBs/dbObjects/bizi_sign_schema"));
const Helper = require("../routs/Helper.js");
const SIrouter = express.Router();
SIrouter.use((0, cors_1.default)({
    origin: "*",
}));
const extractSignedFilesData = (body, userID) => __awaiter(void 0, void 0, void 0, function* () {
    let files = [];
    for (let i = 0; i <= body.length - 1; i++) {
        yield (0, download_1.default)(body[i].file).then((bufferData) => {
            files.push({
                userID: userID,
                AccountKey: "1234",
                file: bufferData,
                state: "signed",
            });
        });
    }
    return files;
});
const handleResults = (result) => {
    console.log({ result });
};
SIrouter.post("/api/saveSignDocuments", Helper.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield req.body;
    const user = req.user;
    const userID = yield Helper.extractUserId(user);
    if (!userID)
        res.send({ status: "no", data: "no user id" });
    const extractedFiles = yield extractSignedFilesData(body, userID);
    const isBiggerThenOne = extractedFiles.length > 1 ? true : false;
    const firstFile = new Schemas.Files(extractedFiles[0]);
    isBiggerThenOne
        ? Schemas.Files.insertMany(extractedFiles)
            .then((result) => {
            handleResults(result);
            res.send({ status: "yes", data: result });
        })
            .catch((e) => {
            console.log(e);
            res.send({ status: "no", data: e });
        })
        : firstFile
            .save()
            .then((result) => {
            handleResults(result);
            res.send({ status: "yes", data: result });
        })
            .catch((e) => {
            console.log(e);
            res.send({ status: "no", data: e });
        });
}));
module.exports = SIrouter;
