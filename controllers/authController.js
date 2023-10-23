const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { BadRequest } = require("../errors");

const register = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    throw new BadRequest("Please fill all fields");
  }

  if (password !== confirmPassword) {
    throw new BadRequest("Passwords do not match");
  }

  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({
    msg: "Registered Successfully",
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });
};

const login = async (req, res) => {
  res.send("login");
};

const logout = async (req, res) => {
  res.send("logout");
};

module.exports = { register, login, logout };
