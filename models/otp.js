const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const otpTemplate = require("../mail/Varification/emailVerificationTemplate"); // your fancy template
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



async function sendVerificationEmail(email, otp, name = "User") {
    try {
        const htmlBody = otpTemplate(otp, name); // generate full HTML
        const mailResponse = await mailSender(
            email,
            "Your OTP for Verification",
            htmlBody
        );
        console.log("mail sent successfully", mailResponse);
        return mailResponse;

    } catch (error) {
        console.log("error occured while sending mail", error);
    }
}


otpSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
});

module.exports = mongoose.model("OTP", otpSchema);