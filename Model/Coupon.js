const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    couponname: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("coupon", couponSchema);
module.exports = Coupon;
