const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const { validateUser } = require("../middleware/validation");

const router = express.Router();

router.post("/register", validateUser, register);
router.post("/sign-in", login);
router.post("/sign-out", logout);

module.exports = router;
