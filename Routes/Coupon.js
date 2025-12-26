const express = require("express");
const router = express.Router();
const {
  addCoupon,
  getCoupons,
  //   getCouponById,
  editCoupon,
  deleteCoupon,
  checkCouponByName,
} = require("../Controller/Coupon");

router.post("/addcoupon", addCoupon);
router.get("/getcoupon", getCoupons);
// router.get("/:id", getCouponById);
router.put("/editcoupon/:id", editCoupon);
router.delete("/deletecoupon/:id", deleteCoupon);
router.post("/check", checkCouponByName);
module.exports = router;
