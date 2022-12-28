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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = exports.ROrouter = void 0;
const express_1 = __importDefault(require("express"));
const trpc = __importStar(require("@trpc/server"));
const trpcExpress = __importStar(require("@trpc/server/adapters/express"));
const zod_1 = require("zod");
exports.ROrouter = express_1.default.Router();
const cors = require("cors");
exports.ROrouter.use(cors({
    origin: "*",
}));
exports.appRouter = trpc.router().query("getmatrixes", {
    input: zod_1.z
        .object({
        text: zod_1.z.string(),
    })
        .nullish(),
    resolve({ input }) {
        return;
        {
            data: input === null || input === void 0 ? void 0 : input.text;
        }
    },
});
exports.ROrouter.use("/trpc", trpcExpress.createExpressMiddleware({
    router: exports.appRouter,
}));
module.exports = exports.ROrouter;
