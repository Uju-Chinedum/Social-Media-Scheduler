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
    data: {
      status: 201,
      message: "Registered Successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        igUsername: user.igUsername,
      },
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

  req.session.regenerate(function (err) {
    if (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Session regeneration failed" });
    }

    req.session.user = {
      email,
      userId: user._id,
      username: user.igUsername,
      password: user.igPassword,
    };
    res.status(StatusCodes.OK).json({
      data: {
        status: 200,
        message: "Login Successful",
        user: req.session.user,
      },
    });
  });
};

const logout = async (req, res) => {
  await req.session.destroy();

  res
    .status(StatusCodes.OK)
    .json({ data: { status: 200, message: "Logout Successful" } });
};

module.exports = { register, login, logout };
