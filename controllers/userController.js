const { StatusCodes } = require("http-status-codes");
const {
  NotFoundError,
  UnauthenticatedError,
  BadRequestError,
} = require("../errors");
const User = require("../models/User");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const user = await User.find({ role: "user" }, "-password");
  const total = await User.countDocuments({ role: "user" });
  if (!user) {
    throw new NotFoundError("No Users Found");
  }
  res.status(StatusCodes.OK).json({ user: user, total });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) {
    throw new NotFoundError("No User Found");
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new BadRequestError("Please Provide all Values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  if (!oldpassword || !newpassword) {
    throw new BadRequestError("Please Provide both Values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isCorrect = await user.comparePassword(oldpassword);
  if (!isCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  user.password = newpassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
