const express = require("express");
const { register, login, logout } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/sign-in", login);
router.post("/sign-out", logout);

module.exports = router;
