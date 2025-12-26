const Subscription = require("../Model/Subscription");

const generateOrderId = () => {
    return "ORD_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
};

const generateTransactionId = () => {
    return "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
};

exports.createSubscription = async (req, res) => {
    try {
        const { userId, planId } = req.body;

        if (!userId || !planId) {
            return res.status(400).json({
                success: false,
                message: "userId and planId are required",
            });
        }

        const subscription = new Subscription({
            userId,
            planId,
            orderId: generateOrderId(),
            transactionId: generateTransactionId(),
        });

        await subscription.save();

        res.status(201).json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate("userId")
            .populate("planId");

        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate("userId")
            .populate("planId");

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        res.status(200).json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getSubscriptionByUserId = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            userId: req.params.userId,
        }).populate("planId");

        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteSubscription = async (req, res) => {
    try {
        const deleted = await Subscription.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Subscription deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
