const User = require('../models/user');
const mailSender = require('../utils/mailSender');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const { passwordResetTemplate } = require("../mail/Varification/passwordResetTemplate");

// resetPasswordToken

exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req body

        const email = req.body.email;

        const user = await User.findOne({ email: email })
        if (!user) {
            return res.json({
                success: false,
                message: "Your email is not registered"
            });
        }

        // generate token 
        const token = crypto.randomUUID();

        // update user by adding token and expiration time 
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        );

        // create url
        const url = `http://localhost:5173/update-password/${token}`

        // send mail contaiining the url

        await mailSender(email,
            "password Reset link",
            passwordResetTemplate(user.firstName, url)
        );

        return res.json({
            success: true,
            message: "password change link has successfully sent to the Emial"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending rest password email"
        })

    }
}


// reset password

exports.resetPassword= async(req,res)=>{
    try {
        
    // data fetch 
    const {password ,confirmPassword,token}= req.body;
    //validation
    if(password!=confirmPassword){
       return res.json({
            success:false,
            message:"password do not match"
        });

    }

    // get user detail from DB using token
    const userDetails = await User.findOne({token:token});
    // if no entry invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:'Token is invalid',
        });
    }
    // token time check
    if(userDetails. resetPasswordExpires < Date.now()){
        return res.json({
            success:false,
            message:'Token is expired, please generate your token'
        });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password,10);

    // password update 
    await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},
    );
    return res.status(200).json({
        success:true,
        message:'Password reset successfully'
    });

    } catch (error) {
       console.log(error);
       return res.status(500).json({
        success:false,
        message:'Somthing went wrong while sending reset pwd mail'
       });
        
    }
}