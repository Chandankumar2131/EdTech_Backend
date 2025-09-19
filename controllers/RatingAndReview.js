const RatingAndReview = require('../models/ratingAndReview');
const Course = require('../models/course');
const { default: mongoose } = require('mongoose');

exports.createRating = async (req, res) => {
    try {
        // get user id
        const userId = req.user.id;
        console.log("👉 User ID:", userId);

        // fetch data from request body
        const { rating, review, courseId } = req.body;
        console.log("👉 Request Body:", { rating, review, courseId });

        // check if user is enrolled or not
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $in: [userId] },
        });

        console.log("👉 Course Details:", courseDetails);

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: "student is not enrolled in the course"
            });
        }

        // check if user is already reviewed or not
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        });

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course already reviewed by user"
            });
        }

        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course: courseId,
            user: userId
        });

        console.log("👉 Created Rating:", ratingReview);

        // update course with this rating/review
        await Course.findByIdAndUpdate(
            { _id: courseId },
            { $push: { ratingAndReview: ratingReview._id } }
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Review created successfully",
            ratingReview,
        });
    } catch (error) {
        console.log("❌ ERROR in createRating:", error.message, error);
        return res.status(500).json({
            success: false,
            message: "faild while creating rating and review",
            error: error.message
        });
    }
};


// getAverageRating
exports.getAverageRating = async(req,res)=>{
    try {
            // get course id
            const courseId = req.body.courseId;

            // calculate average rating
            const result = await RatingAndReview.aggregate([
                {

                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating:{$avg:"$rating"},
                    }
                }
            ])
            // return ratting
            if(result.length>0){

                return res.status(200).json({
                    success:true,
                    averageRating:result[0].averageRating,
                     totalReviews: result[0].totalReviews,
                })
            }

            return res.status(200).json({
                success:true,
                message:"Average Rating is 0, no ratings given till now",
                averageRating:0,
            })

    } catch (error) {
         return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}



//getAllRating
exports.getAllRating = async(req,res)=>{
    try {
         const allReviews = await RatingAndReview.find({})
            .sort({ createdAt: -1 }) // latest reviews first
            .populate({
                path: "user",
                select: "firstName lastName email image" // only these fields of user
            })
            .populate({
                path: "course",
                select: "courseName" // only course name
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        });

    } catch (error) {
      return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
            error: error.message,
        });
    }
}