const Profile = require('../models/profile');
const User = require('../models/user');
const { uploadImageToCloudinary } = require("../utils/imageUploader"); // import your helper

// Update Profile Picture
exports.updateProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if file is uploaded
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const imageFile = req.files.image;

    // Upload to Cloudinary (you can pass folder name)
    const uploadResult = await uploadImageToCloudinary(imageFile, "profile_pics");

    // Update user record with new image URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: uploadResult.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      imageUrl: uploadResult.secure_url,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating profile picture",
      error: error.message,
    });
  }
};


exports.updateProfile = async (req, res) => {
    try {
        // get data
        const { firstName = "", lastName = "", dateOfBirth = "", gender, about = "", contactNumber } = req.body;

        // get userId
        const id = req.user.id;

        // validate 
        if (!contactNumber || !gender) {
            return res.status(400).json({
                success: false,
                message: "please fill all fields"
            });
        }

        //find User and Profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update User model with firstName and lastName
        userDetails.firstName = firstName;
        userDetails.lastName = lastName;
        await userDetails.save();

        //update Profile model
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        await profileDetails.save();

        // return response
        return res.status(200).json({
            success: true,
            message: "profile updated successfully",
            profileDetails,
        });
    } catch (error) {
        console.error("Error updating Profile:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating Profile",
            error: error.message
        });
    }
}


// delete account 

exports.deleteAccount = async (req, res) => {
    try {
        //get id
        const userId = req.user.id;
        const userDetails = await User.findById(userId);

        // validation
        if (!userDetails) {

            return res.status(400).json({
                success: false,
                message: "user not found"
            });
        }
        const userProfile = userDetails.additionalDetails;

        // delete profile

        // Explore -> how we schedule this deletion opration
        await Profile.findByIdAndDelete(userProfile)
        // TODO : HW unenroll user from enrolled course
        //delete user
        await User.findByIdAndDelete(userId)
        // return response

        return res.status(200).json({
            success: true,
            message: "Acount Deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting Profile:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting Profile",
            error: error.message
        });
    }
}


exports.getAllUserDetails = async (req, res) => {
    try {

        const id = req.user.id;
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success: true,
            message: "User Dta fetched successfully",
            userDetails,
        })
    } catch (error) {
        console.error("Error :", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong fetching details",
            error: error.message
        });
    }
}