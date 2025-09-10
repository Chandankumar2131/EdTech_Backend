const express = require("express");
const router = express.Router();

const { verifySignature, capturePayment } = require("../controllers/Payment");
const { auth, isStudent } = require("../middlewares/auth");

// ***************************************************************************
//                        Payment Routes
// ***************************************************************************

// Student initiates payment
router.post("/capture-payment", auth, isStudent, capturePayment);

// Razorpay verifies signature (Webhook)
router.post("/verify-signature", verifySignature);

module.exports = router;
