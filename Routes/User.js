const express = require("express");
const router = express.Router();
const {
  signup,
  loginRequest,
  loginVerify,
  resendOTP,
  updateUser,
  getUserById,
  getalluser,
} = require("../Controller/User");

router.post("/signup", signup);
router.post("/loginRequest", loginRequest);
router.post("/loginVerify", loginVerify);
router.post("/resendOTP", resendOTP);
router.put("/update-user/:userId", updateUser);
router.get("/get-user/:userId", getUserById);
router.get("/alluser", getalluser);

module.exports = router;
