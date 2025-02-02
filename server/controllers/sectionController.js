const Course = require('../models/Course');
const Section = require('../models/Section');

exports.createSection = async (req, res) => {
  try {
    // fetch data
    const { sectionName, courseId } = req.body;

    // validation
    if (!courseId || !sectionName) {
      return res.status(401).json({
        success: false,
        message: 'Missing Properties',
      });
    }

    // create section entry
    const newSection = await Section.create({ sectionName });

    // create the entry in the course model for this section
    const updatedCourseData = await Course.findByIdAndUpdate(
      { courseId: courseId },
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: 'Section created successfully',
      data: updatedCourseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Not able to create a section',
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionId, sectionName } = req.body;

    if (!sectionId || !sectionName) {
      return res.status(401).json({
        success: false,
        message: 'Missing Properties',
      });
    }

    await Section.findByIdAndUpdate(
      { sectionId },
      { sectionName: sectionName },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Section updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not able to update the section, Try again!!!',
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!sectionId) {
      return res.status(401).json({
        success: false,
        message: 'Missing Properties',
      });
    }

    await Section.findByIdAndDelete(sectionId);

    return res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not able to delete the section, Try again!!!',
      error: error.message,
    });
  }
};
