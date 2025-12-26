const mongoose = require("mongoose");

const Planchema = new mongoose.Schema({
  PlanName: {
    type: String,
    required: true,
  },
  Price: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const PlanModel = mongoose.model("plan", Planchema);
module.exports = PlanModel;
