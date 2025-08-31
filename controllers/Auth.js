const User = require('../models/user')
const OTP = require('../models/otp');
const otpGenrator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const profile = require('../models/profile');
const mailSender = require('../utils/mailSender');


// send otp  

exports.sendOTP = async (req, res) => {

    try {
        // fetch email from user body
        const { email } = req.body;

        // check if user already exist
        const checkUserPresent = await User.findOne({ email });

        // if User exist, then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User already registred',
            })
        }

        // generate OTP
        var otp = otpGenrator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated:", otp);

        // check unique otp or not
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenrator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }
        const otpPayLoad = { email, otp };

        // ctreate an entry for OTP
        const otpBody = await OTP.create(otpPayLoad);   //  here sendVerificationEmail(email, otp) functiomn will be triggered and will 
        // send mail otp due topre middleware applied on otp schema
        console.log(otpBody);
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};




// sign up


exports.signup = async (req, res) => {
    try {
        // fetch data from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: 'All the fields are required'
            });
        }

        //check password matching 
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and Confirm password does not match'
            });
        }

        // check the user already exist or not
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User is already registerd'
            });
        }

        // Find most recent OTP for user
        const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOTP);

        // validate otp
        if (recentOTP.length == 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found'
            })
        } else if (otp != recentOTP[0].otp) {
            return res.status(400).json({
                success: false,
                message: 'invalid otp'
            });
        }




        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //entry create in database

        const profileDetails = await profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })


        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            contactNumber,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

        })

        return res.status(200).json({
            success: true,
            message: "user is registered successfully"
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Somthing went wrong while user registration'
        });

    }
}

// login
exports.login = async (req, res) => {
    try {
        // get data from req body
        const { email, password } = req.body;

        // validate data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "all fields are required"
            });
        }
        // check user existance

        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user is not registerd plaese sign up first"
            })
        }

        // generate JWT, after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });
            user.token = token;
            user.password = undefined;

            // create coocki
            const option = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie('token', token, option).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully"
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "password is incorrect"
            })
        }



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "login failure, please try again"
        });

    }
}


// change password
exports.changePassword = async (req, res) => {
    try {
        // get data from user 
        const { oldPassword, newPassword, confirmPassword } = req.body;
        // validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "all fileds are required "
            });

        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'newPassword and ConfirmPassword do not match '
            });
        }


        // Get user from DB(req.user comes from auth middleware after JWT verification)
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }


        // compare old password
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();


        await mailSender(user.email, "Password Changed", "Your password was successfully updated.");
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error("Error in changePassword:", error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while changing password",
            error: error.message,
        });
    }
}