const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');


// auth
exports.auth = async (req, res, next) => {
    try {
        // extract token

        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer", "");
        // if token is missing then response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token is missing"
            });
        }
        // varify token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'token is invalid'
            })
        }
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error.message);
        return res.status(500).json({
            success: false,
            message: "Token verification failed",
        });
    }
}


//isStudent

exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(403).json({
                success: false,
                message: "This is protected route for the students"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role verification failed",
        });
    }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(403).json({
                success: false,
                message: "This is protected route for the Instructor"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role verification failed",
        });
    }
}


// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "This is protected route for the Admin"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role verification failed",
        });
    }
}