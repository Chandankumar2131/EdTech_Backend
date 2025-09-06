const mongoose = require('mongoose');
const { instance } = require('../config/razorpay');
const Course = require('../models/course');
const User = require('../models/user');
const mailSender = require('../utils/mailSender');
const crypto = require("crypto");

// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  try {
    const { course_id } = req.body;
    const userId = req.user.id;

    // validation
    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide courseID",
      });
    }

    // course details
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // already enrolled check
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled",
      });
    }

    // create order
    const amount = course.price;
    const currency = "INR";

    const options = {
      amount: amount * 100, // in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: course_id,
        userId,
      },
    };

    const paymentResponse = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      amount: paymentResponse.amount,
      currency: paymentResponse.currency,
    });
  } catch (error) {
    console.error("Capture Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error.message,
    });
  }
};

// verify signature of Razorpay and server
exports.verifySignature = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "12345678";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
      console.log("✅ Payment is authorized");

      const { courseId, userId } = req.body.payload.payment.entity.notes;

      // enroll student in course
      const enrollCourse = await Course.findByIdAndUpdate(
        courseId,
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrollCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // add course to student
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        { $push: { courses: courseId } },
        { new: true }
      );

      // send confirmation email
      await mailSender(
        enrolledStudent.email,
        "Congratulations 🎉",
        "You are successfully enrolled in a new course!"
      );

      return res.status(200).json({
        success: true,
        message: "Signature verified and student enrolled",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Signature verification failed",
      });
    }
  } catch (error) {
    console.error("Verify Signature Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in signature verification",
      error: error.message,
    });
  }
};
