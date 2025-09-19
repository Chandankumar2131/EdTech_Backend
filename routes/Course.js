const express = require("express");
const router = express.Router();

const {
  createCourse,
  showallCourses,
  getCourseDetails,
  buyCourse,
  getEnrolledCourses
} = require("../controllers/Course");

const {
  createCategory,
  showAllCategory,
  categoryPageDetails,
} = require("../controllers/Category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

const {
  createSubsection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection");

const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");

// =======================
// COURSE
// =======================
router.post("/course/create", auth, isInstructor, createCourse);
router.get("/course/get-all", showallCourses);
router.post("/course/details", getCourseDetails);
router.post("/course/buyCourse", auth, isStudent, buyCourse);
router.get("/course/getEnrolledCourses", auth, isStudent, getEnrolledCourses);
// =======================
// CATEGORY
// =======================
router.post("/category/create", auth, isAdmin, createCategory);
router.get("/category/get-all", showAllCategory);
router.post("/category/details", categoryPageDetails);

// =======================
// SECTION
// =======================
router.post("/section/create", auth, isInstructor, createSection);
router.put("/section/update", auth, isInstructor, updateSection);
router.delete("/section/delete/:courseId/:sectionId", auth, isInstructor, deleteSection);

// =======================
// SUBSECTION
// =======================
router.post("/subsection/create", auth, isInstructor,createSubsection);
router.put("/subsection/update", auth, isInstructor, updateSubSection);
router.delete("/subsection/delete", auth, isInstructor, deleteSubSection);

// =======================
// RATING & REVIEW
// =======================
router.post("/rating/create", auth, isStudent, createRating);
router.get("/rating/average", getAverageRating);
router.get("/rating/get-all", getAllRating);

module.exports = router;
