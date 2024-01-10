import express, { Request, Response } from "express";
require("./helpers/InitMongoDB");
const morgan = require("morgan");

const app = express();
app.use(morgan("dev"));

app.get("/", (request: Request, response: Response) => {
  response.send("get request successful");
});

app.listen(7000, () => {
  console.log("app listening to port 7000");
});
