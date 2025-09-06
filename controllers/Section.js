const Section = require('../models/section');
const Course = require('../models/course');

//create section
exports.createSection = async (req, res) => {
    try {
        // data fetch
        const { sectionName, courseId } = req.body;
        // validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing property"
            });
        }
        //create section
        const newSection = await Section.create({ sectionName })
        //update course with section objectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId, {
            $push: {
                courseContent: newSection._id,
            }
        },
            { new: true }).populate({
                path: "courseContent",
                populate: { path: "subSection" }
            });
        // use populate to replace section / subsectoins both in the updated course details
        return res.status(200).json({
            success: true,
            message: "section created successfully",
            updatedCourseDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "somthing went wrong while course creating"
        });
    }
}


// update section

exports.updateSection = async (req, res) => {
    try {
        //fetch data
        const { sectionName, sectionId } = req.body;
        // validation
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing property"
            });

        }

        //update section
        const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true })
        return res.status(200).json({
            success: true,
            message: "section updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "somthing went wrong while course upadating"
        });
    }
}
// delete section
exports.deleteSection = async (req, res) => {
    try {
        const { sectionId, courseId } = req.params;

        if (!sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing sectionId or courseId"
            });
        }

        // Remove section from Course
        await Course.findByIdAndUpdate(courseId, {
            $pull: { courseContent: sectionId }
        });
           // Remove section
        await Section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success: true,
            message: "Section deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting section",
            error: error.message
        });
    }
};