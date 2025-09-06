const SubSection = require('../models/subSection');
const Section = require('../models/section');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
require('dotenv').config();
// create Subsection

exports.createSubsection = async (req, res) => {
    try {
        // fetch data
        const { sectionId, title, timeDuration, description } = req.body
        // extract file/vedio
        const video = req.files.videoFile;
        //validation
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        // upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //create subsection
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })
        // upadte section with this subsection objId 
        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId },
            {
                $push: {
                    subSection: SubSectionDetails._id,
                }
            },
            { new: true }
        ).populate("subSection");

        // log updated section here after populated quarry

        return res.status(200).json({
            success: true,
            message: 'Updated section successfully',
            data: updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating Subsection",
            error: error.message
        });
    }

}

// HW: upload sub section 

exports.updateSubSection = async (req, res) => {
    try {

        const { subSectionId, title, description, timeDuration } = req.body;

        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "Subsection not found"
            });
        }
        if (req.files && req.files.videoFile) {
            const video = req.files.videoFile;

            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
        }

        if (title) subSection.title = title;
        if (description) subSection.description = description;
        if (timeDuration) subSection.timeDuration = timeDuration;

        await subSection.save();
        return res.status(200).json({
            success: true,
            message: "Subsection updated successfully",
            data: subSection
        });
    } catch (error) {
        console.error("Error updating subsection:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating Subsection",
            error: error.message
        });

    }
}

// delete subsection

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;

        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "subSectionId and sectionId are required"
            });
        }
        // remove subsection reference from Section
        await Section.findByIdAndUpdate(sectionId, {
            $pull: { subSection: subSectionId }
        });
        // delete subsection document
        const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);

        if (!deletedSubSection) {
            return res.status(404).json({
                success: false,
                message: "Subsection not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subsection deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting subsection:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting Subsection",
            error: error.message
        });
    }
}