import express, { Request, Response } from "express";
import AuthRoute from "./routes/AuthRoute";
import { error } from "console";
const CreateError = require("http-errors");
const { verifyAccessToken } = require("./helpers/jwtHelpers");

require("./helpers/InitMongoDB");
const morgan = require("morgan");
require("dotenv").config();
const PORT = process.env.PORT || 7000;

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", AuthRoute);

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.send({
    error: {
      status: error.status || 500,
      message: error.message,
    },
  });
});

app.get("/", verifyAccessToken, (request: Request, response: Response) => {
  response.send("get request successful");
});

app.use(async (req, res, next) => {
  next(CreateError.NotFound("path not found"));
});

app.listen(7000, () => {
  console.log("app listening to port 7000");
});
