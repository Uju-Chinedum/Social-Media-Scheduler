const express = require("express");
const {
  getMe,
  updateUser,
  updatePassword,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.route("/").get(getMe)
router.route("/me").patch(updateUser).delete(deleteUser);
router.route("/me/update-password").patch(updatePassword);

module.exports = router;
