const {User} = require("../models/User")
const {OTP} = require("../models/OTP")
const OTPGenerator = require("otp-generator")
const bycrpt = require("bcrypt")
const jwt = require("jsonwebtoken")

// otp generator
exports.sendOTP = async(req, res) => {
    try {
        const {email} = req.body

        let checkUserPresent = await User.findOne({email})

        if(checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User Already Present"
            })
        }

        let otp = OTPGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })
        console.log("OTP generator:", otp)

        let result = await OTP.findOne({otp})

        while(result) {
            otp = OTPGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })

            result = await OTP.findOne({otp})
        }

        let otpPayload = {email, otp}

        const otpBody = await OTP.create(otpPayload)
        console.log("Entry saved", otpBody)

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully!!!",
            otp
        })
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// signup
exports.signUp = async(req, res) => {
    try {
        const {firstName,
              lastName, 
              email,
              password, 
              confirmPassword,
              accountType,
              contactNumber,
              otp} = req.body
        
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(401).json({
                success: false,
                message: "Fill all the fields"
            })
        } 

        if(password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords did not match, Try again!!!"
            })
        }

        const recentOtp = await OTP.findOne({email}).sort({createdAt:-1}).limit(1)
        if(recentOtp != otp) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP"
            })
        }
        else if(recentOtp.length == 0) {
            return res.status(401).json({
                success: false,
                message: "OTP is missing"
            })
        }

        let hashedPassword = await bycrpt.hash(password,10)

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null, 
            about: null,
            contactNumber: null
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}&${lastName}`
        })

        return res.status(200).json({
            success: true,
            message: "User registered successfully!!!",
            user      
        })
    }
    catch(error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// login
exports.login = async(req, res) => {
    try {
        const {email, password} = req.body

        if(!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All field are required"
            })
        }

        const user = await User.findOne({email}).populate("Additional Details")
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, kindly signup first!!!"
            })
        }

        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            })
            user.token = token
            user.password = undefined

            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                htmlOnly: true
            }

            return res,cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "LoggedIn Successfully!!!"
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            })
        }

    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// change Password
exports.changePassword = async(req, res) => {
    try {
        const {email, password, changedPassword, confirmPassword} = req.body

        if(changedPassword != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords did not match, Try again!!!"
            })
        }

        const user = await User.findOne({email})

        if(password != user.password) {
            return res.status(400).json({
                success: false,
                message: "Passwords did not match, Try again!!!"
            })
        }
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}