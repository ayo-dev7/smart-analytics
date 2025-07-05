/* eslint-disable @nx/enforce-module-boundaries */
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import morgan from "morgan";
import helmet from "helmet";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import logger from '../../../packages/logger/logger';
import { apiRateLimit } from '../../../packages/middleware/rate-limiting';

dotenv.config();

const app = express();

app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(cors({
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
  origin: "http://localhost:3000"
}));

app.use(cookieParser());
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({limit: "10mb", extended: true}));

app.use(morgan("combined", {
  stream: {write: (message:string) => logger.info(message.trim())}
}));
app.set("trust proxy",1);

app.use(apiRateLimit);

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Gateway running successfully!' });
});

app.use('/',proxy('http://localhost:7001'));

const port = process.env.PORT || 9001;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', (err) => {
  logger.error(`Api Gateway Error: ${err}`)
});
