const Category = require('../models/category');
 
// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required"
            });
        }

        const categoryDetails = await Category.create({ name, description });

        return res.status(200).json({
            success: true,
            message: "Category created successfully",
            category: categoryDetails
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all categories
exports.showAllCategory = async (req, res) => {
    try {
        const allCategory = await Category.find({}, { name: true, description: true });
        return res.status(200).json({
            success: true,
            message: "All categories returned successfully",
            data: allCategory
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Category page details
exports.getCategoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReview",
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (selectedCategory.courses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No courses found in this category",
        data: {
          selectedCategory,
          differentCategory: null,
          mostSellingCourses: [],
        },
      });
    }

    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    let differentCategory = null;

    if (categoriesExceptSelected.length > 0) {
      differentCategory = await Category.findById(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: "ratingAndReview",
        })
        .exec();
    }

    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReview",
      })
      .exec();

    const allCourses = allCategories.flatMap((cat) => cat.courses);

    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
