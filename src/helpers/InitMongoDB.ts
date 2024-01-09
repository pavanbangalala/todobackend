require("dotenv").config();
import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_DB_URI, {
    dbName: process.env.DB_NAME,
    user: process.env.USER_NAME,
    pass: process.env.PASS,
  })
  .then((response) => console.log("Connection to DB succesful"))
  .catch((error) => console.log(error.message));

mongoose.connection.on("connected", () => {
  console.log("Connection to DB completed");
});

mongoose.connection.on("error", (error) =>
  console.log("Could not connect to DB : ", error)
);

mongoose.connection.on("disconnected", () =>
  console.log("disconnected from DB")
);

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
