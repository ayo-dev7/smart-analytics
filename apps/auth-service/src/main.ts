/* eslint-disable @nx/enforce-module-boundaries */
import express from 'express';
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from '../../../packages/error-middleware/error-middleware';
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from '../../../packages/lib/trpc';
import {createContext} from "../../../packages/lib/context";
import logger from '../../../packages/logger/logger';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 7001;

const app = express();

app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(cors({
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
  origin: "http://localhost:3000"
}));

app.use(cookieParser());

app.use(errorMiddleware);

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

app.use('/trpc', trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: async({req,res}) => {
        return await createContext(req,res);
    }
}));

const server = app.listen(port, host, () => {
    logger.info(`🚀 SmartAnalytics API server running on port ${port}`);
    logger.info(`📊 Health check: http://localhost:${port}/health`);
    logger.info(`🔗 API base URL: http://localhost:${port}/api`);
});

server.on("error", (err) => {
    logger.error(`Authentication Server Error: ${err}`);
});
