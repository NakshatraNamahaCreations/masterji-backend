


const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
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
    orderId: String,
    transactionId: String,
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: Date,
    status: {
        type: String,
        default: "active",
    },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
