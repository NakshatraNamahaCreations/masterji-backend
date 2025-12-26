const express = require("express");
const router = express.Router();
const bookingCtrl = require("../Controller/Booking");

router.post("/addbooking", bookingCtrl.addBooking);
router.get("/booking/:userId", bookingCtrl.getUserBookings);
router.get("/all", bookingCtrl.getAllBookings);
router.get(
    "/check/:userId/:courseId",
    bookingCtrl.checkCoursePurchased
);
module.exports = router;
