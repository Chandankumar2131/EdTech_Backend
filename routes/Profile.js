const express = require("express");
const router = express.Router();

const { 
  updateProfile, 
  deleteAccount, 
  getAllUserDetails, 
  updateProfilePic
} = require("../controllers/Profile");

const{resetPasswordToken,resetPassword}= require('../controllers/ResetPassword');

const { auth } = require("../middlewares/auth");

// ***************************************************************************
//                        Profile Routes
// ***************************************************************************

router.put("/update", auth, updateProfile);
router.delete("/delete", auth, deleteAccount);
router.get("/details", auth, getAllUserDetails);

router.post("/reset-password-token",resetPasswordToken);
router.post("/update-password",resetPassword);
router.put("/upload-profile-picture",auth,updateProfilePic);



module.exports = router;
