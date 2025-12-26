const mongoose = require("mongoose");
const FavoriteCourse = require("../Model/Favorite");
const Course = require("../Model/Course");

exports.toggleFavoriteCourse = async (req, res) => {
  try {
    const { CourseId, userId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!CourseId || !mongoose.isValidObjectId(CourseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid CourseId" });
    }

    const exists = await Course.exists({ _id: CourseId });
    if (!exists) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const found = await FavoriteCourse.findOne({ userId, CourseId });
    if (found) {
      await FavoriteCourse.deleteOne({ _id: found._id });
      return res.status(200).json({
        success: true,
        favorited: false,
        message: "Removed from favorites",
      });
    }

    await FavoriteCourse.create({ userId, CourseId });
    return res.status(201).json({
      success: true,
      favorited: true,
      message: "Added to favorites",
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(200).json({
        success: true,
        favorited: true,
        message: "Already favorited",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

exports.getMyFavoriteCourses = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const favs = await FavoriteCourse.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "CourseId",
        model: "Course", // no select => return full data
      })
      .lean();

    const data = favs.map((f) => ({
      favoriteId: f._id,
      course: f.CourseId, // full course object
      createdAt: f.createdAt,
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

exports.getMyFavoriteCourseIds = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });
    }

    const ids = await FavoriteCourse.find({ userId }).distinct("CourseId");

    return res.status(200).json({
      success: true,
      ids: ids.map(String),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

exports.isCourseFavorited = async (req, res) => {
  try {
    const { userId } = req.query;
    const { CourseId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(CourseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid CourseId" });
    }

    const found = await FavoriteCourse.exists({ userId, CourseId });
    return res.status(200).json({ success: true, favorited: !!found });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
