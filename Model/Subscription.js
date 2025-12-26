const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },

        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "plan",
            required: true,
        },

        planType: {
            type: String,
            enum: ["monthly", "3months", "6months", "yearly"],
            required: true,
        },

        amount: {
            type: Number, // INR
            required: true,
        },

        orderId: String,        // Razorpay order id
        transactionId: String, // Razorpay payment id

        startDate: {
            type: Date,
            default: Date.now,
        },

        endDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
