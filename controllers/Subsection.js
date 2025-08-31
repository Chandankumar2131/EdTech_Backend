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
                message: "All fileds are required"
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

// delete subsection