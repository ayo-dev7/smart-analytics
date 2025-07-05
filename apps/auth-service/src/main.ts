import express from 'express';
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from '../../../packages/error-middleware/error-middleware';

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

const server = app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
});

server.on("error", (err) => {
    console.log(`Authentication Server Error: ${err}`);
});
