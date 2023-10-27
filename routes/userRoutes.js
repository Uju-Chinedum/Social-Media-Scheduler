const express = require("express");
const {
  getMe,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.route("/").get(getMe)
router.route("/me").patch(updateUser).delete(deleteUser);

module.exports = router;
