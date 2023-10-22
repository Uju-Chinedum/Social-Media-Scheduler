const { StatusCodes } = require("http-status-codes");

const notFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    statusCode: 404,
    msg: "Page does not exist. Please recheck URL",
  });
};

module.exports = notFound;
