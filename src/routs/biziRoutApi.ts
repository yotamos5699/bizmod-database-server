import express, { Request, Response } from "express";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { EventEmitter } from "events";

import { z } from "zod";
export const ROrouter = express.Router();

const cors = require("cors");
ROrouter.use(
  cors({
    origin: "*",
  })
);

export const appRouter: any = trpc.router().query("getmatrixes", {
  input: z
    .object({
      text: z.string(),
    })
    .nullish(),
  resolve({ input }) {
    return;
    {
      data: input?.text;
    }
  },
});

export type AppRouter = typeof appRouter;

ROrouter.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

module.exports = ROrouter;
