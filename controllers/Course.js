const Course = require('../models/course');
const Category = require('../models/category');
const Section = require('../models/section');
const SubSection = require('../models/subSection');
const CourseProgress = require('../models/courseProgress'); 
const User = require('../models/user');
const { uploadImageToCloudinary,deleteResourceFromCloudinary} = require('../utils/imageUploader');
const { convertSecondsToDuration } = require("../utils/secToDuration")


exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, category,timeDuration } = req.body;

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
            createdAt: Date.now(),
            timeDuration:timeDuration,
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

// ================ Edit Course Details ================
exports.editCourse = async (req, res) => {
  try {
    const { courseId, ...body } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // If thumbnail image is provided, upload and update
    if (req.files && req.files.thumbnailImage) {
      const thumbnailImage = await uploadImageToCloudinary(
        req.files.thumbnailImage,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // Convert `body` to plain object if it's FormData or stringified JSON
    const updates = {};
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        try {
          updates[key] = JSON.parse(body[key]); // parse JSON if needed
        } catch (err) {
          updates[key] = body[key]; // leave as string if not JSON
        }
      }
    }

    // Update course fields
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        course[key] = updates[key];
      }
    }

    course.updatedAt = Date.now();

    await course.save();

    const updatedCourse = await Course.findById(courseId)
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

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while updating course",
      error: error.message,
    });
  }
};



// ================ Get a list of Course for a given Instructor ================
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({ instructor: instructorId, }).sort({ createdAt: -1 }).populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          model: "SubSection"
        }
      });


        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
            // totalDurationInSeconds:totalDurationInSeconds,
            message: 'Courses made by Instructor fetched successfully'
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}


// ================ Get Full Course Details ================
exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        // console.log('courseId userId  = ', courseId, " == ", userId)

        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReview")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        // let courseProgressCount = await CourseProgress.findOne({
        //     courseID: courseId,
        //     userId: userId,
        // })

        //   console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        //   count total time duration of course
        // let totalDurationInSeconds = 0
        // courseDetails.courseContent.forEach((content) => {
        //     content.subSection.forEach((subSection) => {
        //         const timeDurationInSeconds = parseInt(subSection.timeDuration)
        //         totalDurationInSeconds += timeDurationInSeconds
        //     })
        // })

        // const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                // totalDuration,
                // completedVideos: courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos : [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
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

// ================ Delete the Course ================
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // delete course thumbnail From Cloudinary
        await deleteResourceFromCloudinary(course?.thumbnail);

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    const subSection = await SubSection.findById(subSectionId)
                    if (subSection) {
                        await deleteResourceFromCloudinary(subSection.videoUrl) // delete course videos From Cloudinary
                    }
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Error while Deleting course",
            error: error.message,
        })
    }
}

