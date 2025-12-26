const Booking = require("../Model/Booking");
const Course = require("../Model/Course");
const mongoose = require("mongoose");
const User = require("../Model/User");

exports.addBooking = async (req, res) => {
  try {
    const { userId, courseId, paymentStatus, couponname, discount } = req.body;

    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: "userId and courseId are required" });
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(courseId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId or courseId" });
    }

    const existingBooking = await Booking.findOne({
      userId,
      courseId,
      paymentStatus: "paid",
    });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this course",
      });
    }

    const newBooking = await Booking.create({
      userId,
      courseId,
      paymentStatus: paymentStatus || "pending",
      couponname,
      discount,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (err) {
    console.error("addBooking error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });
    }

    const bookings = await Booking.find({ userId, paymentStatus: "paid" })
      .populate("courseId")
      .sort({ createdAt: -1 })
      .lean();

    const data = bookings.map((b) => ({
      bookingId: b._id,
      paymentStatus: b.paymentStatus,
      purchasedAt: b.createdAt,
      course: b.courseId,
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("getUserBookings error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("courseId")
      .populate("userId")
      .sort({ createdAt: -1 })
      .lean();

    const data = bookings.map((b) => ({
      bookingId: b._id,
      paymentStatus: b.paymentStatus,
      purchasedAt: b.createdAt,
      course: b.courseId,
      user: b.userId,
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("getUserBookings error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};


exports.checkCoursePurchased = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "userId and courseId are required",
      });
    }
    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(courseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or courseId",
      });
    }
    const booking = await Booking.findOne({
      userId,
      courseId,
      paymentStatus: "paid",
    });
    return res.status(200).json({
      success: true,
      purchased: !!booking,
    });
  } catch (err) {
    console.error("checkCoursePurchased error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};
