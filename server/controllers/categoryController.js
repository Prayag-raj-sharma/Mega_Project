const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    // fetch data
    const { name, description } = req.body;

    // validations
    if (!name) {
      return res.status(401).json({
        success: false,
        message: 'Fields are missing',
      });
    }

    // add data
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(categoryDetails);

    return res.status(200).json({
      success: true,
      message: 'Category created successfully!!!',
    });
  } catch (error) {
    // error in any steps
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Error occur while creating tag',
    });
  }
};

// get all tags
exports.getAllCategories = async (req, res) => {
  try {
    // fetch details
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );

    return res.status(200).json({
      success: true,
      message: 'All tags details fetched successfully!!!',
      allCategories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
