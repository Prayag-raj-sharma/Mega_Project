const Section = require('../models/Section');
const SubSection = require('../models/SubSection');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
require('dotenv').config();

exports.createSubSection = async (req, res) => {
  try {
    // fetch data
    const { sectionId, title, description } = req.body;

    const video = req.files.video;

    // validation
    if (!sectionId || !title || !description || !video) {
      return res.status(401).json({
        success: false,
        message: 'Missing Properties',
      });
    }

    // store the video on cloudinary
    const videoDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    console.log(uploadDetails);

    // create section entry
    const newSubSection = await Section.create({
      title: title,
      timeDuration: `${videoDetails.timeDuration}`,
      description: description,
      videoUrl: videoDetails.secure_url,
    });

    // create the entry in the course model for this section
    const updatedSectionData = await Section.findByIdAndUpdate(
      { sectionId },
      {
        $push: {
          subSection: newSubSection._id,
        },
      },
      { new: true }
    ).populate('subSection');

    return res.status(200).json({
      success: true,
      message: 'SubSection created successfully',
      data: updatedSectionData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Not able to create a subSection',
      error: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;
    const subSection = await Section.findById(sectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: 'SubSection not found',
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    return res.status(200).json({
      success: true,
      message: 'Sub Section updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not able to update the section, Try again!!!',
      error: error.message,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.params;

    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: 'SubSection not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
      sectionDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not able to delete the section, Try again!!!',
      error: error.message,
    });
  }
};
