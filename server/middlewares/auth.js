const jwt = require("jsonwebtoken")
require("dotenv").config()
const User = require("../models/User")

// auth
exports.auth = async(req, res, next) => {
    try {
        const token = req.cookie.token 
                      || req.body.token 
                      || req.header("Authorisation").replace("Bearer ","");

        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            })
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            console.log(decode)
            req.user = decode;
        }
        catch(error) {
            return res.status(403).json({
                success: false,
                message: "Invalid Token"
            })
        }
        next();
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating the token"
        })
    }
}

// is Student
exports.isStudent = async(req, res, next) => {
    try {
        if(req.user.accountType != "Student") {
            return res.status(401).json({
                success: false,
                message: "Protected route for student only"
            })
        }
        next();
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error: User role cannot be verified. Try again !!!"
        })
    }
}

// is Instructor
exports.isInstructor = async(req, res, next) => {
    try {
        if(req.user.accountType != "Instructor") {
            return res.status(401).json({
                success: false,
                message: "Protected route for instructor only"
            })
        }
        next();
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error: User role cannot be verified. Try again !!!"
        })
    }
}

// is Admin
exports.isAdmin = async(req, res, next) => {
    try {
        if(req.user.accountType != "Admin") {
            return res.status(401).json({
                success: false,
                message: "protected route for Admin only"
            })
        }
        next();

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error: User role cannot be verified. Try again !!!"
        })
    }
}