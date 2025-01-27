const Course = require("../models/Course")
const User = require("../models/User")
const Category = require("../models/Category")
const {uploadImageToCloudinary} = require("../utils/imageUploader")
require("dotenv").config()

exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        // fetch thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validations
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // check instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        if(!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found"
            })
        }

        // check tag
        const tagDetails = await Category.findById(tag);
        if(!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag not found"
            })
        }

        // upload thumbnail to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        
        // create a course payload
        const coursePayload = {
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url
        }

        const newCourse = await Course.create(coursePayload);

        // add the same course in the inst list
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id
                }
            },
            {new:true}
        )

        // add the same course in the tag list
        await Category.findByIdAndUpdate(
            {_id: tag},
            {
                $push: {
                    cousers: newCourse._id
                }
            },
            {new:true}
        )

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
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

exports.getAllCourses = async(req, res) => {
    try {
        const allCourses = await Course.find({});
        return res.status(200).json({
            success: true,
            message: "Fetched all courses successfully",
            data:allCourses
        })
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Cannot fetch all courses",
            error: error.message
        })
    }
}