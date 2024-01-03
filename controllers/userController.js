const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { NotFound, BadRequest } = require("../errors");

const getMe = async (req, res) => {
  const { userId } = req.user;

  const user = await User.findOne({ _id: userId }).select(
    "-igPassword -password -confirmPassword"
  );
  if (!user) {
    throw new NotFound(`No user with id: ${userId}`);
  }

  res.status(StatusCodes.OK).json(user);
};

const updateUser = async (req, res) => {
  const { userId } = req.user;

  const { firstName, lastName, email, igUsername, igPassword } = req.body;
  if (!firstName || !lastName || !email || !igUsername || !igPassword) {
    throw new BadRequest("Please fill all fields");
  }

  const user = await User.findOne({ _id: userId }).select(
    "-igPassword -password -confirmPassword"
  );

  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.username = igUsername;
  user.password = igPassword;

  await user.save();

  req.session.user.email = email;
  req.session.user.igUsername = igUsername;
  req.session.user.igPassword = igPassword;

  res.status(StatusCodes.OK).json({ user: user });
};

const updatePassword = async (req, res) => {
  const { userId } = req.user;

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequest("Please fill all fields");
  }

  const user = await User.findOne({ _id: userId });

  const isPassword = await user.comparePassword(oldPassword);
  if (!isPassword) {
    throw new Unauthenticated("Incorrect password");
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password updated successfully" });
};

const deleteUser = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findOne({ _id: userId });

  await user.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "User account deleted successfully" });
};

module.exports = { getMe, updateUser, updatePassword, deleteUser };
