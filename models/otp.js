const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const otpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        trim: true,

    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60,
    }

})

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Your OTP for Verification", `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`);
        console.log("mail sent successfully", mailResponse);


    } catch (error) {
        console.log("error occured while sending mail", error);


    }
}

otpSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
});

module.exports = mongoose.model("OTP", otpSchema);