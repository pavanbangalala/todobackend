const jwt = require("jsonwebtoken");
require("dotenv").config();
const CreateError = require("http-errors");

module.exports = {
  signAccessToken: (userId) => {
    const payload = { name: "access token" };
    const secret = process.env.ACCESS_KEY_SECRET;
    const options = {
      expiresIn: "30s",
      audience: userId.toString(),
      issuer: "ishaaps.com",
    };
    return new Promise(async (resolve, reject) => {
      await jwt.sign(payload, secret, options, (error, token) => {
        if (error) reject(CreateError.InternalServerError());
        resolve(token);
      });
    });
  },

  signRefreshToken: (userId) => {
    const payload = { name: "refresh token" };
    const secret = process.env.REFRESH_KEY_SECRET;
    const options = {
      expiresIn: "1y",
      audience: userId.toString(),
      issuer: "ishapps.com",
    };

    return new Promise(async (resolve, reject) => {
      await jwt.sign(payload, secret, options, (error, token) => {
        if (error) reject(CreateError.InternalServerError());
        resolve(token);
      });
    });
  },

  verifyAccessToken: (req, res, next) => {
    console.log("request ", req.Headers);
    if (!req.Headers["authorization"]) {
      return next(CreateError.Unauthorized());
    }

    const token = req.Headers.authorization.split(" ")[1].toString().trim();
    jwt.verify(token, process.env.ACCESS_KEY_SECRET, (error, payload) => {
      if (error) {
        const message =
          error.name === "jsonwebtokenerror" ? "unauthorized" : error.message;
        return next(message);
      }
      req.payload = payload;
      next();
    });
  },
};
