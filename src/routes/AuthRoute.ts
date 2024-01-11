import express, { NextFunction, Request, Response } from "express";
const User = require("../Schema/UserSchema");
import CreateError from "http-errors";
import { RegistrationSchema, LoginSchema } from "../helpers/validationSchema";
import bcrypt from "bcrypt";
const { signAccessToken, signRefreshToken } = require("../helpers/jwtHelpers");

const route = express.Router();

route.post(
  "/register",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      console.log("register user");
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

export default route;
