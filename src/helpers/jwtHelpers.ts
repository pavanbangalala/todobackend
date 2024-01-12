const jwt = require("jsonwebtoken");
require("dotenv").config();
const CreateError = require("http-errors");
const redisClient = require("./initRedis");

module.exports = {
  signAccessToken: (userId) => {
    const payload = { name: "access token" };
    const secret = process.env.ACCESS_KEY_SECRET;
    const options = {
      expiresIn: "4 days",
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
      await jwt.sign(payload, secret, options, async (error, token) => {
        if (error) reject(CreateError.InternalServerError());
        await redisClient.set(
          userId,
          token,
          { EX: 365 * 24 * 60 * 60 },
          (error, reply) => {
            if (error) {
              console.log(error.message);
              reject(CreateError.InternalServerError());
              return;
            }
          }
        );
        resolve(token);
      });
    });
  },

  verifyAccessToken: (req, res, next) => {
    console.log("request ", req.headers);
    if (!req.headers["authorization"]) {
      return next(CreateError.Unauthorized());
    }

    const token = req.headers.authorization.split(" ")[1].toString().trim();
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

  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      console.log("verifyRefreshToken ", refreshToken);
      console.log("REFRESH_KEY_SECRET ", process.env.REFRESH_KEY_SECRET);
      jwt.verify(
        refreshToken,
        process.env.REFRESH_KEY_SECRET,
        (error, payload) => {
          console.log("payload", payload);
          if (error) {
            const message =
              error.name === "jsonwebtokenerror"
                ? "unauthorized"
                : error.message;
            return reject(CreateError.Unauthorized(message));
          }
          const userId = payload.aud;
          console.log("82 userId", userId);
          redisClient.get(userId, (error, result) => {
            if (error) {
              reject(CreateError.InternalServerError());
              return;
            }

            if (result === refreshToken) {
              return resolve(userId);
            }
            console.log("92");
            return reject(CreateError.Unauthorized());
          });
        }
      );
    });
  },
};
