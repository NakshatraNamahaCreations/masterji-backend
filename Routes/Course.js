const express = require("express");
const router = express.Router();
const courseCtrl = require("../Controller/Course");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/addcourses", upload.single("courseImage"), courseCtrl.addCourse);
router.get("/getcourses", courseCtrl.getCourses);
router.get("/courses/:courseId", courseCtrl.getCourseById);
router.put(
  "/updatecourses/:courseId",
  upload.single("courseImage"),
  courseCtrl.updateCourse
);
router.delete("/delete/:courseId", courseCtrl.deleteCourse);
router.post("/courses/search", courseCtrl.searchCourses);

module.exports = router;
