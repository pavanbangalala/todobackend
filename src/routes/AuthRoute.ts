import express, { NextFunction, Request, Response } from "express";
const User = require("../Schema/UserSchema");
import CreateError from "http-errors";
import { RegistrationSchema, LoginSchema } from "../helpers/validationSchema";
import bcrypt from "bcrypt";
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwtHelpers");
const redisClient = require("../helpers/initRedis");
const route = express.Router();

route.post(
  "/register",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      console.log("register user", request.body);
      // validate schema
      const result = await RegistrationSchema.validateAsync(request.body);
      // dereference request body
      const { username, email, password } = result;
      //check if the requst body has email and password
      if (!email || !password)
        throw CreateError.BadRequest("email or password missing");
      //check if user already exists in the database
      const existinngUser = await User.findOne({ email: email });
      if (existinngUser) {
        console.log("existing user ", existinngUser);
        throw CreateError.Conflict(`${email} already exists`);
      }

      const newUser = new User({ email, username, password });
      const savedUser = await newUser.save();
      const accessToken = await signAccessToken(savedUser.id);
      const refreshToken = await signRefreshToken(savedUser.id);

      response.status(200).send({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  }
);

route.post(
  "/login",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      console.log("request body", request.body);
      const result = await LoginSchema.validateAsync(request.body);
      const savedUser = await User.findOne({ email: result.email });
      if (!savedUser) throw CreateError.NotFound("user not registered");
      console.log("savedUser.password", savedUser.password);
      console.log("result.password", result.password);
      const isMatch = await bcrypt.compare(result.password, savedUser.password);
      console.log("isMatch", isMatch);
      if (!isMatch)
        throw CreateError.Unauthorized("username/password not valid");
      const accessToken = await signAccessToken(savedUser.id);
      const refreshToken = await signRefreshToken(savedUser.id);

      response.status(200).send({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      if (error.isJoi === true)
        return next(CreateError.BadRequest("Invalid username/password"));
      next(error);
    }
  }
);

route.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw CreateError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    res.send({ accessToken: accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
});

route.delete("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    console.log("req.body", refreshToken);
    if (!refreshToken) throw CreateError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    console.log("user id", userId);
    redisClient.DEL(userId, (error, result) => {
      if (error) {
        throw CreateError.InternalServerError(error.message);
      }
      res.status(204).send({ message: "logout success" });
      console.log(res);
    });
  } catch (error) {
    next(error);
  }
});

export default route;
