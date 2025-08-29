const Course = require('../models/course');
const Tag = require('../models/tags');
const User = require('../models/user');
const { uploadImageToCloudinary } = require('../utils/imageUploader');


exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
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
        const tagDetails = await Tag.findById(tag);
        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag details not found"
            });
        }

        // upload Image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create new entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tagDetails._id,
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
        await Tag.findByIdAndUpdate({ _id: tagDetails._id },
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



// getAllCourses Handler function

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
            message:"data for all courses fetched successfully",
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