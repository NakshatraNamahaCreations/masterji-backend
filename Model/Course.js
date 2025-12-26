const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    video: [
      {
        videotitle: { type: String },
        videolink: { type: String },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    courseImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
