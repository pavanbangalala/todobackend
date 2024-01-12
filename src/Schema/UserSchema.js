const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    min: 5,
    required: true,
  },
  email: {
    type: String,
    min: 6,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    min: 6,
    required: true,
  },
});

UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(this.password, salt);
    this.password = encryptedPassword;
    next();
  } catch (error) {
    next(error);
  }
  console.log("before saving");
});

UserSchema.methods.isPasswordValid = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const user = mongoose.model("user", UserSchema);
module.exports = user;
