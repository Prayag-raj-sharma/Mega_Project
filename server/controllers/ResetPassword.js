const User = require("../models/User")
require("dotenv").config()
const bcrypt = require("bcrypt")
const { mailSender } = require("../utils/mailSender")

// reset password token
exports.resetPasswordToken = async(req, res) => {
    try {
        const {email} = req.body

        const user = await User.findOne({email: email})

        if(!user) {
            return res.json({
                success: false,
                message: "User is not present for this email"
            })
        }

        const token = crypto.randomUUID();

        const updatedDetails = await User.findOneAndUpdate(
                                       {email: email},
                                       {
                                        token: token,
                                        resetPasswordExpires: Date.now() + 5*60*1000
                                       },
                                       {new: true}
                                    )

        const url = `http://localhost:3000/update-password/${token}`

        await mailSender(email,
                         "Password Reset Link",
                         `Password Reset Url: ${url}`)

        return res.status(200).json({
            success: true,
            message: "Password Reset Link sent successfully!!!"
        })
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// reset password
exports.resetPassword = async(req, res) => {
    try {
        const {password, confirmPassword, token} = req.body

        if(password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Passwords are not matching"
            })
        }
        
        const userDetails = await User.findOne({token: token});

        if(!userDetails) {
            return res.json({
                success: false,
                message: "User Details are not present for this token"
            })
        }

        if(userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token got expired"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true}
        )

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        })
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}