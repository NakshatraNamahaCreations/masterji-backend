const Course = require("../Model/Course");


exports.addCourse = async (req, res) => {
  try {
    const { title, desc, price } = req.body;
    if (!title || !desc || !price) {
      return res
        .status(400)
        .json({ message: "Title, desc, and price are required" });
    }
    const courseImage = req.file ? req.file.path : null;
    let videos = [];
    if (req.body["video.videotitle"] && req.body["video.videolink"]) {
      if (Array.isArray(req.body["video.videotitle"])) {
        videos = req.body["video.videotitle"].map((title, i) => ({
          videotitle: title,
          videolink: req.body["video.videolink"][i],
        }));
      } else {
        videos = [
          {
            videotitle: req.body["video.videotitle"],
            videolink: req.body["video.videolink"],
          },
        ];
      }
    }
    const newCourse = new Course({
      title,
      desc,
      price,
      video: videos,
      courseImage,
    });
    await newCourse.save();
    return res.status(201).json({
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (err) {
    console.error("addCourse error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (err) {
    console.error("getCourses error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({
      message: "Course fetched successfully",
      data: course,
    });
  } catch (err) {
    console.error("getCourseById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, desc, price } = req.body;
    let { video } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (title) course.title = title;
    if (desc) course.desc = desc;
    if (price) course.price = price;

    let videos = [];
    if (req.body["video.videotitle"] && req.body["video.videolink"]) {
      if (Array.isArray(req.body["video.videotitle"])) {
        videos = req.body["video.videotitle"].map((title, i) => ({
          videotitle: title,
          videolink: req.body["video.videolink"][i],
        }));
      } else {
        videos = [
          {
            videotitle: req.body["video.videotitle"],
            videolink: req.body["video.videolink"],
          },
        ];
      }
      course.video = videos;
    }

    if (req.file) {
      course.courseImage = req.file.path;
    }

    course.updatedAt = new Date();
    await course.save();

    return res.status(200).json({
      message: "Course updated successfully",
      data: course,
    });
  } catch (err) {
    console.error("updateCourse error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("deleteCourse error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.searchCourses = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }
    const courses = await Course.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { desc: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    console.error("searchCourses error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
