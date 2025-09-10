const express = require("express");
const router = express.Router();

const { login, signup, sendOTP, changePassword } = require("../controllers/Auth");
const { resetPasswordToken, resetPassword } = require("../controllers/ResetPassword");
const { auth } = require("../middlewares/auth");

// ***************************************************************************
//               Authentication Routes
// ***************************************************************************

// User signup & login
router.post("/signup", signup);
router.post("/login", login);

// OTP & Password
router.post("/send-otp", sendOTP);
router.post("/change-password", auth, changePassword);

// Reset Password
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

module.exports = router;
