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
  const Body = await req.body;
  const isExist = await BiziRowConfig.findOne({ userID: Body.userID });
  if (!validateBody(Body)) return res.send({ status: false, data: "data not ok" });

  if (isExist) {
    // @ts-ignore
    const isExistObj = isExist._doc;

    checkIfChanges(isExistObj, Body);
    BiziRowConfig.updateOne(
      { userID: Body.userID },
      {
        $set: { ...Body, id: isExist._id },
      }
    );
    return res.send({ status: true, data: "קובץ הגדרות עודכן..." });
  } else {
    const data = new BiziRowConfig(Body);
    return data
      .save()
      .then((result) => res.send({ status: true, data: result }))
      .catch((err) => res.send({ status: false, data: err }));
  }
});

RowRouter.post("/bizi_row/get_config", async (req: Request, res: Response) => {
  const { userID } = await req.body;
  const isExist = await BiziRowConfig.findOne({ userID: userID });
  if (!isExist) return res.send({ status: false, data: "אין הגדרות בדאטה בייס" });
  return res.send({ status: true, data: isExist });
});
module.exports = RowRouter;
