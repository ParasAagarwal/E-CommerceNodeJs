const User = require("../models/User");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
  const { email, password, name } = req.body;
  const checkEmail = await User.findOne({ email: email });
  if (checkEmail) {
    throw new BadRequestError("UserAlready exists");
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ name, email, password, role });

  const tokenuser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenuser });
  res.status(StatusCodes.CREATED).json({
    user: tokenuser,
  });
};

const login = async (req, res) => {
  const { password, email } = req.body;
  if (!password || !email) {
    throw new BadRequestError("Please Provide both Details");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("User Not Found or Invalid Credentials");
  }
  const ispasswordCorrect = await user.comparePassword(password);

  if (!ispasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const tokenuser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenuser });

  res.status(StatusCodes.OK).json({
    user: tokenuser,
  });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User Logged Out!" });
};

module.exports = {
  register,
  login,
  logout,
};
