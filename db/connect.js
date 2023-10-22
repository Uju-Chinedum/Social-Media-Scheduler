const mongoose = require("mongoose");

const connectDB = (url) =>
  mongoose.set("debug", true).connect(url, {
    maxPoolSize: 500,
  });

module.exports = connectDB;
