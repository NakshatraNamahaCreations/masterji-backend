const express = require("express");
const router = express.Router();
const bannerCtrl = require("../Controller/Banners");

const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder to store banners
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

// ✅ Create multer instance
const upload = multer({ storage, fileFilter });

// Routes
router.post("/addbanner", upload.single("bannerImage"), bannerCtrl.addBanner);
router.get("/getbanner", bannerCtrl.getBanners);
router.get("/:bannerId", bannerCtrl.getBannerById);
router.put(
  "/editbanner/:bannerId",
  upload.single("bannerImage"),
  bannerCtrl.updateBanner
);
router.delete("/delete/:id", bannerCtrl.deleteBanner);

module.exports = router;
