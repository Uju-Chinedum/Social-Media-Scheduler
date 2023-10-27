const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { BadRequest, Unauthenticated } = require("../errors");

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
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequest("Please enter all credentials");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Unauthenticated("Incorrect Email");
  }

  const isPassword = await user.comparePassword(password);
  if (!isPassword) {
    throw new Unauthenticated("Incorrect Password");
  }

  req.session.regenerate((err) => {
    if (err) {
      return next(err);
    }
  });

  req.session.user = { email, userId: user._id };
  res
    .status(StatusCodes.OK)
    .json({ msg: "Login Successful", user: req.session.user });
};

const logout = async (req, res) => {
  res.send("logout");
};

module.exports = { register, login, logout };
