const { StatusCodes } = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
  let customError = {};
  customError.data = {
    status: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong!! Please try again.",
  };

  if (err.name === "ValidationError") {
    customError.data.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    customError.data.status = StatusCodes.BAD_REQUEST;
  }

  if (err.code && err.code === 11000) {
    customError.data.message = `This ${Object.keys(
      err.keyValue
    )} is already used by a user. Please use another ${Object.keys(
      err.keyValue
    )}.`;
    customError.data.status = StatusCodes.BAD_REQUEST;
  }

  if (err.name === "CastError") {
    customError.data.message = `No item found with id: ${err.value}`;
    customError.data.status = StatusCodes.NOT_FOUND;
  }

  return res.status(customError.data.status).json(customError);
};

module.exports = errorHandler;
