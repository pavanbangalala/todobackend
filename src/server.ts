import express, { Request, Response } from "express";

const app = express();

app.get("/", (request: Request, response: Response) => {
  response.send("get request successful");
});

app.listen(7000, () => {
  console.log("app listening to port 7000");
});
