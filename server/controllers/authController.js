const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bycrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require('../mail/templates/passwordUpdate');
const Profile = require('../models/Profile');
require('dotenv').config();

// otp generator
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    let checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: 'User Already Present',
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log('OTP generator:', otp);

    let result = await OTP.findOne({ otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp });
    }

    let otpPayload = { email, otp };

    const otpBody = await OTP.create(otpPayload);
    console.log('Entry saved', otpBody);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully!!!',
      otp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// signup
exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(401).json({
        success: false,
        message: 'Fill all the fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords did not match, Try again !!!',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please sign in to continue.',
      });
    }

    const response = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(response);
    if (response.length === 0) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    } else if (otp !== response[0].otp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    }

    let hashedPassword = await bycrpt.hash(password, 10);

    let approved = '';
    approved === 'Instructor' ? (approved = false) : (approved = true);

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      approved: approved,
      accountType: accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}&${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: 'User registered successfully!!!',
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'User cannot be registered. Please try again.',
    });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: 'All field are required',
      });
    }

    const user = await User.findOne({ email }).populate('Additional Details');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User is not registered, kindly signup first!!!',
      });
    }

    if (await bycrpt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        htmlOnly: true,
      };

      return res.cookie('token', token, options).status(200).json({
        success: true,
        token,
        user,
        message: 'LoggedIn Successfully!!!',
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Login Failure. Please Try Again !!!',
    });
  }
};

// change Password
exports.changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);

    const { oldPassword, changedPassword, confirmPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: 'The password is incorrect' });
    }

    if (changedPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords did not match, Try again!!!',
      });
    }

    const hashedChangedPassword = await bycrpt.hash(changedPassword, 10);

    const updatedUserDetails = await User.findOneAndUpdate(
      { email: email },
      { password: hashedChangedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log('Email sent successfully:', emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error('Error occurred while sending email:', error);
      return res.status(500).json({
        success: false,
        message: 'Error occurred while sending email',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password is changed successfully!!!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Error while updated the password',
    });
  }
};
