const mongoose = require("mongoose");
const { mailSender } = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        default: Date.noew(),
        expires: 5*60
    }
});

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = mailSender(email, "For verification", otp);
        console.log("SEnt mail", mailResponse)
    }
    catch(error) {
        console.log("Error comes while sending a mail", error);
        console.error(error);
    }
}

OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();  
})

module.exports = mongoose.model("OTP", OTPSchema);