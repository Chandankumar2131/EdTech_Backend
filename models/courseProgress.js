const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  userId: {                      // ✅ ADD THIS (you are using it in create)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  completedVideos: [             // ✅ MUST BE ARRAY
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    }
  ]
});

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
