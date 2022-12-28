import * as express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import download from "download";
import * as Schemas from "../DBs/dbObjects/bizi_sign_schema";
const Helper = require("../routs/Helper.js");
const SIrouter = express.Router();
SIrouter.use(
  cors({
    origin: "*",
  })
);
type fileSchema = mongoose.InferSchemaType<typeof Schemas.files>;
const extractSignedFilesData = async (body: any[], userID: string): Promise<fileSchema[]> => {
  let files: fileSchema[] = [];
  for (let i = 0; i <= body.length - 1; i++) {
    await download(body[i].file).then((bufferData: Buffer) => {
      files.push({
        userID: userID,
        AccountKey: "1234",
        file: bufferData,
        state: "signed",
      });
    });
  }
  return files;
};

const handleResults = (result: any) => {
  console.log({ result });
};

SIrouter.post("/api/saveSignDocuments", Helper.authenticateToken, async (req, res) => {
  const body = await req.body;
  const user: any = req.user;
  const userID = await Helper.extractUserId(user);
  if (!userID) res.send({ status: "no", data: "no user id" });
  const extractedFiles = await extractSignedFilesData(body, userID);
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
});

module.exports = SIrouter;
