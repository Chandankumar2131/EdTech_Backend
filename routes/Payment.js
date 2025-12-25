const express = require('express');
const router = express.Router();

const { capturePayment, verifyPayment,sendPaymentSuccessEmail } = require('../controllers/Payment');
const { auth, isAdmin, isInstructor, isStudent } = require('../middlewares/auth');

router.post('/capturePayment', auth, isStudent, capturePayment);
router.post('/sendPaymentSuccessEmail', auth, isStudent, sendPaymentSuccessEmail);
router.post('/verifyPayment', auth, isStudent, verifyPayment);

module.exports = router