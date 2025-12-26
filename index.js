require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const path = require("path");
const multer = require("multer");
const cors = require("cors");
const userRoute = require("./Routes/User");
const courseRoute = require("./Routes/Course");
const favoriteRoute = require("./Routes/Favorite");
const bookingRoute = require("./Routes/Booking");
const bannerRoute = require("./Routes/Banners");
const adminRoute = require("./Routes/Admin");
const couponRoute = require("./Routes/Coupon");
const PlanRoute = require("./Routes/Plan");
const SubscriptionRoute = require("./Routes/Subscription");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/user", userRoute);
app.use("/api/course", courseRoute);
app.use("/api/favorite", favoriteRoute);
app.use("/api", bookingRoute);
app.use("/api/banner", bannerRoute);
app.use("/api", adminRoute);
app.use("/api", couponRoute);
app.use("/api", PlanRoute);
app.use("/api/subscription", SubscriptionRoute);

const PORT = process.env.CONTENT_PORT || 8002;
const MONGO_URI = process.env.CONTENT_MONGO_URI;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
