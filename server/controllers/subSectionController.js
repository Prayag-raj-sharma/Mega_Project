const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const {uploadImageToCloudinary} = require("../utils/imageUploader")
require("dotenv").config()

exports.createSubSection = async(req, res) => {
    try {
        // fetch data
        const {sectionId, title, timeDuration, description} = req.body;

        const video = req.files.videoFile;

        // validation
        if(!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(401).json({
                success: false,
                message: "Missing Properties"
            })
        }

        // store the video on cloudinary
        const videoDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // create section entry
        const newSubSection = await Section.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: videoDetails.secure_url
        });

        // create the entry in the course model for this section
        const updatedSectionData = await Section.findByIdAndUpdate(
                                        {sectionId},
                                        {
                                            $push: {
                                                subSection: newSubSection._id
                                            }
                                        },
                                        {new:true}
                                        )

        return res.status(200).json({
            success: true,
            message: "SubSection created successfully",
            data: updatedSectionData
        })
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Not able to create a subSection",
            error: error.message
        })
    }
}

exports.updateSubSection = async(req, res) => {
    try {
        const {sectionId, sectionName} = req.body;

        if(!sectionId || !sectionName) {
            return res.status(401).json({
                success: false,
                message: "Missing Properties"
            })
        }

        const sectionDetails = await Section.findByIdAndUpdate(
                                        {sectionId},
                                        {sectionName: sectionName}
                                        )

        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            sectionDetails
        })
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: "Not able to update the section, Try again!!!",
            error: error.message
        })
    }
}

exports.deleteSubSection = async(req, res) => {
    try {
        const {sectionId} = req.params;

        if(!sectionId) {
            return res.status(401).json({
                success: false,
                message: "Missing Properties"
            })
        }

        const sectionDetails = await Section.findByIdAndDelete({sectionId})
                                       
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            sectionDetails
        })
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: "Not able to delete the section, Try again!!!",
            error: error.message
        })
    }
}