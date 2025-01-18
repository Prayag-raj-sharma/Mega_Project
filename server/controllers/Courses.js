const User = require("../models/User")
const Tag = require("../models/Tag")
const {uploadImageToCloudinary} = require("../utils/imageUploader")

exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body

        



    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
    
}