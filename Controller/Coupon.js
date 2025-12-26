const Coupon = require("../Model/Coupon");

const addCoupon = async (req, res) => {
  const { couponname, discount, desc } = req.body;

  try {
    const existingCoupon = await Coupon.findOne({ couponname });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon already exists" });
    }

    const newCoupon = new Coupon({
      couponname,
      discount,
      desc,
    });

    await newCoupon.save();

    res
      .status(201)
      .json({ message: "Coupon created successfully", data: newCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ data: coupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const editCoupon = async (req, res) => {
  const { id } = req.params;
  const { couponname, discount, desc } = req.body;

  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.couponname = couponname || coupon.couponname;
    coupon.discount = discount || coupon.discount;
    coupon.desc = desc || coupon.desc;

    await coupon.save();

    res
      .status(200)
      .json({ message: "Coupon updated successfully", data: coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // await coupon.remove();

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const checkCouponByName = async (req, res) => {
  const { couponname, orderAmount } = req.body;

  try {
    const coupon = await Coupon.findOne({ couponname });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    if (coupon.discount.includes("%")) {
      const percent = parseInt(coupon.discount.replace("%", "").trim(), 10);
      if (isNaN(percent)) {
        return res.status(400).json({ message: "Invalid discount format" });
      }

      if (coupon.desc && coupon.desc.toUpperCase().includes("UP TO")) {
        const maxAmountStr = coupon.desc.replace(/UP TO/i, "").trim();
        const maxAmount = parseInt(maxAmountStr, 10);

        if (isNaN(maxAmount)) {
          return res
            .status(400)
            .json({ message: "Invalid 'UP TO' format in desc" });
        }

        if (orderAmount > maxAmount) {
          return res.status(400).json({
            success: false,
            message: `Coupon valid only for orders up to ₹${maxAmount}`,
          });
        }
      }

      const discountAmount = (orderAmount * percent) / 100;
      const finalAmount = orderAmount - discountAmount;

      return res.status(200).json({
        success: true,
        coupon,
        discountApplied: discountAmount,
        finalAmount: finalAmount,
      });
    }

    return res.status(400).json({ message: "Unsupported discount type" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addCoupon,
  getCoupons,
  editCoupon,
  deleteCoupon,
  checkCouponByName,
};
