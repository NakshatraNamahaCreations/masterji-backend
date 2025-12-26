const express = require("express");
const router = express.Router();
const favCtrl = require("../Controller/Favorite");

router.post("/favorites/toggle", favCtrl.toggleFavoriteCourse);
router.get("/favorites/:userId", favCtrl.getMyFavoriteCourses);
router.get("/favorites/ids/:userId", favCtrl.getMyFavoriteCourseIds);
router.get("/favorites/check/:CourseId", favCtrl.isCourseFavorited);

module.exports = router;
