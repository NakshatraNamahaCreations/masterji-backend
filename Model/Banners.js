const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    bannerImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
module.exports = Banner;
