const Course = require('../models/course');
const Category = require('../models/category');
const User = require('../models/user');
const { uploadImageToCloudinary } = require('../utils/imageUploader');


exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, category } = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "all fields are required",
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log(instructorDetails);
        // TODO verify that userID and instructionDetails_id are same or different
        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not find"
            });
        }

        // check given tag is valid opr not
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found"
            });
        }

        // upload Image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        if (!thumbnailImage?.secure_url) {
            return res.status(500).json({
                success: false,
                message: "Thumbnail upload failed",
            });
        }
        // create new entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        })

        // add the new course to the instructor schema
        await User.findByIdAndUpdate({ _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );

        //update the tag Schema
        await Category.findByIdAndUpdate({ _id: categoryDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Somthing went wrong while course creation",
            error: error.message
        })
    }
}





exports.showallCourses = async (req, res) => {
    try {
        // TOD: change the bellow statement incremently
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReview: true,
            studentsEnrolled: true,
        }).populate('instructor')
            .exec();
        return res.status(200).json({
            success: true,
            message: "data for all courses fetched successfully",
            data: allCourses
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "can not fetch course",
            error: error.message
        })
    }
}


// buy course
exports.buyCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        // find course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // check if user is already enrolled
        if (course.studentsEnrolled.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User is already enrolled in this course",
            });
        }

        // enroll user
        course.studentsEnrolled.push(userId);
        await course.save();

        await User.findByIdAndUpdate(userId, {
            $push: { coursesEnrolled: courseId },
        });

        return res.status(200).json({
            success: true,
            message: "User enrolled in course successfully",
            data: course,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while enrolling in course",
            error: error.message,
        });
    }
};


// controllers/course.js

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log("fetched api of user enrolled courses from the backend");
        
        const userDetails = await User.findById(userId)
            .populate({
                path: "coursesEnrolled",
                populate: {
                    path: "instructor",
                    select: "firstName lastName email",
                },
            })
            .exec();

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Enrolled courses fetched successfully",
            data: userDetails.coursesEnrolled,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching enrolled courses",
            error: error.message,
        });
    }
};



// getAllCourses Handler function
exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const courseDetails = await Course.findById(courseId)
            .populate({
                path: "instructor",
                populate: { path: "additionalDetails" },
            })
            .populate("category")
            .populate("ratingAndReview")
            .populate({
                path: "courseContent",
                populate: { path: "subSection" },
            })
            .exec();

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course details",
            error: error.message,
        });
    }
};