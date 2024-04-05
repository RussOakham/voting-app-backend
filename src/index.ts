import express, { Express } from "express";
import dotenv from "dotenv";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(
  cors({
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const server = http.createServer(app);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
