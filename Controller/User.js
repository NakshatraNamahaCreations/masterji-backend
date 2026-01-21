const User = require("../Model/User");
const Otp = require("../Model/Otp");
const crypto = require("crypto");
const sendOtpSms = require("../utills/sendOtpSms");

const normalizePhone = (phoneNumber) => {
  return phoneNumber.replace(/[^\d]/g, ""); // removes non-digit characters
};

exports.signup = async (req, res) => {
  try {
    const phoneNumber = normalizePhone(req.body.phoneNumber);
    const { name, email } = req.body;

    if (!phoneNumber || !name || !email) {
      return res
        .status(400)
        .json({ message: "Name, email, and phone are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ phoneNumber }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please login." });
    }

    const user = await User.create({
      phoneNumber,
      name,
      email,
    });

    return res.status(201).json({
      message: "Signup successful",
      data: user,
    });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// exports.loginRequest = async (req, res) => {
//   try {
//     const phoneNumber = normalizePhone(req.body.phoneNumber);
//     if (!phoneNumber) {
//       return res.status(400).json({ message: "Phone number is required" });
//     }

//     const otp = String(crypto.randomInt(1000, 10000));
//     const expiry = new Date(Date.now() + 2 * 60 * 1000);

//     await Otp.findOneAndUpdate(
//       { phoneNumber },
//       { otp, expiry },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     return res.status(200).json({
//       message: "OTP sent successfully",
//       otp,
//     });
//   } catch (err) {
//     console.error("loginRequest error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// exports.loginVerify = async (req, res) => {
//   try {
//     const phoneNumber = normalizePhone(req.body.phoneNumber);
//     const otpInput = String(req.body.otp || "").trim();

//     if (!phoneNumber || !otpInput) {
//       return res
//         .status(400)
//         .json({ message: "phoneNumber and otp are required" });
//     }

//     const record = await Otp.findOne({ phoneNumber });
//     if (!record) {
//       return res
//         .status(400)
//         .json({ message: "OTP not found. Please request a new one." });
//     }

//     if (new Date(record.expiry) < new Date()) {
//       await Otp.deleteOne({ _id: record._id });
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     if (String(record.otp) !== otpInput) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     const user = await User.findOne({ phoneNumber });
//     await Otp.deleteOne({ _id: record._id });

//     if (!user) {
//       return res
//         .status(401)
//         .json({ message: "User not found. Please signup first" });
//     }

//     return res.status(200).json({
//       message: "Login successful",
//       data: user,
//     });
//   } catch (err) {
//     console.error("loginVerify error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };



exports.loginRequest = async (req, res) => {
  try {
    const phoneNumber = normalizePhone(req.body.phoneNumber);
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Generate a 4-digit OTP securely using crypto
    const otp = String(crypto.randomInt(1000, 10000));
    const expiry = new Date(Date.now() + 2 * 60 * 1000); // OTP expires in 2 minutes

    // Insert or update OTP record in the database
    await Otp.findOneAndUpdate(
      { phoneNumber },
      { otp, expiry },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send OTP via SMS
    await sendOtpSms(phoneNumber, otp);

    return res.status(200).json({
      message: "OTP sent successfully",
      // otp, // You may want to remove this in production
    });
  } catch (err) {
    console.error("loginRequest error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.loginVerify = async (req, res) => {
  try {
    const phoneNumber = normalizePhone(req.body.phoneNumber);
    const otpInput = String(req.body.otp || "").trim();

    if (!phoneNumber || !otpInput) {
      return res.status(400).json({ message: "Phone number and OTP are required" });
    }

    // Find OTP record
    const record = await Otp.findOne({ phoneNumber });
    if (!record) {
      return res.status(400).json({ message: "OTP not found. Please request a new one." });
    }

    // Check if OTP expired
    if (new Date(record.expiry) < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Validate OTP
    if (String(record.otp) !== otpInput) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Find the user
    const user = await User.findOne({ phoneNumber });
    await Otp.deleteOne({ _id: record._id }); // Delete OTP after successful validation

    if (!user) {
      return res.status(401).json({ message: "User not found. Please signup first" });
    }

    return res.status(200).json({
      message: "Login successful",
      data: user,
    });
  } catch (err) {
    console.error("loginVerify error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const phoneNumber = normalizePhone(req.body.phoneNumber);
    if (!phoneNumber) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const otp = String(crypto.randomInt(1000, 10000));
    const expiry = new Date(Date.now() + 2 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { phoneNumber },
      { otp, expiry },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "OTP resent successfully",
      otp, // ⚠️ remove in prod
    });
  } catch (err) {
    console.error("resendOTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required in params" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    user.updatedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required in params" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getalluser = async (req, res) => {
  try {
    const alluser = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: alluser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
