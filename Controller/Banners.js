const Banner = require("../Model/Banners");

exports.addBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Banner image is required" });
    }

    const newBanner = await Banner.create({
      bannerImage: req.file.path,
    });

    return res.status(201).json({
      success: true,
      message: "Banner added successfully",
      data: newBanner,
    });
  } catch (err) {
    console.error("addBanner error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: banners });
  } catch (err) {
    console.error("getBanners error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }
    return res.status(200).json({ success: true, data: banner });
  } catch (err) {
    console.error("getBannerById error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    if (req.file) {
      banner.bannerImage = req.file.path;
    }

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (err) {
    console.error("updateBanner error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("bannerId", id);
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    console.error("deleteBanner error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
