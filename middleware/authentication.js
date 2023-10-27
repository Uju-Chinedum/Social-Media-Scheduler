const { Unauthenticated } = require("../errors");

const auth = async (req, res, next) => {
  if (!req.session.user) {
    throw new Unauthenticated("Authentication Invalid");
  }

  next();
};

module.exports = auth;
