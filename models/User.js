const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: [true, "Please provide a first name"],
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, "Please provide a last name"],
  },
  email: {
    type: String,
    unique: true,
    index: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email.",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    minlength: 8,
  },
});

// Hashing Password
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = this.password;
});

// Checking Password
UserSchema.methods.comparePassword = async function (candidate) {
  const isMatch = await bcrypt.compare(candidate, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
