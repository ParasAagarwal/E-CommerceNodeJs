const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserScehma = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide Name"],
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please Provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please Provide Valid Email",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Provide Password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

UserScehma.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(this.password, salt);
  this.password = hashedpassword;
});

UserScehma.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserScehma);
