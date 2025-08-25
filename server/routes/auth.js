const express = require("express");
const router = express.Router();
const { verifyToken, logout, googleLogin } = require("../controllers/authController");

router.get("/google", googleLogin);
router.get("/verify", verifyToken);
router.post("/logout", logout);

module.exports = router;
