import express, { Request, Response, request } from "express";
import { BiziRowConfig } from "../DBs/dbObjects/bizi_row";
import cors from "cors";
const RowRouter = express.Router();

RowRouter.use(
  cors({
    origin: "*",
  })
);
// type BiziRowConfig = typeof
const validateBody = (body: any) => {
  return true;
};

const checkIfChanges = (
  object: {
    _id: any;
    userID: string;
    headersConfig: {
      replacmentName: unknown[] | string[];
      initialName?: string | undefined;
    };
    createdAt: any;
    updatedAt: any;
    __v: any;
  },
  body: any
) => {
  isExistObj: ["Date", "userID", "headersConfig", "createdAt", "updatedAt", "__v"];
  delete object._id;
  delete object.__v;
  delete object.updatedAt;
  delete object.createdAt;
};

RowRouter.post("/bizi_row/set_config", async (req: Request, res: Response) => {
  console.log("in set config", req.body);
  const Body = await req.body;
  const userID = Body.userID;
  const searchData = await BiziRowConfig.find({ userID: userID });
  if (searchData.length == 0) {
    new BiziRowConfig(Body)
      .save()
      .then((result) => {
        console.log("***************************** saving row config data !!!! ******************************");
        res.send({ status: true, data: result });
      })
      .catch((e) => {
        console.log(e);
        res.send({ status: "no", data: e });
      });
  } else {
    delete Body.userID;
    BiziRowConfig.updateOne(
      { userID: userID },
      {
        $set: { ...Body, id: searchData[0]._id },
      }
    )
      .then((result) => {
        console.log("***************************** updating matrix data !!!! ******************************");
        console.log({ result });
        res.send({ status: false, data: result });
      })
      .catch((e) => {
        res.send({ status: false, data: e });
      });
  }
});

RowRouter.post("/bizi_row/get_config", async (req: Request, res: Response) => {
  console.log("in get config ", req.body);
  const { userID } = await req.body;
  const isExist = await BiziRowConfig.findOne({ userID: userID });
  if (!isExist) return res.send({ status: false, data: "אין הגדרות בדאטה בייס" });
  return res.send({ status: true, data: isExist });
});

RowRouter.post("/bizi_row/del_config", async (req: Request, res: Response) => {
  console.log("in get config ", req.body);
  const { userID } = await req.body;
  const isExist = await BiziRowConfig.findOneAndRemove({ userID: userID });
  if (!isExist) return res.send({ status: false, data: "אין הגדרות בדאטה בייס" });
  return res.send({ status: true, data: isExist });
});
module.exports = RowRouter;
