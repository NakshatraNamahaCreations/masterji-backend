const Subscription = require("../Model/Subscription");

const generateOrderId = () => "ORD_" + Date.now();
const generateTransactionId = () => "TXN_" + Date.now();

const getEndDate = (planType) => {
    const end = new Date();
    if (planType === "monthly") end.setMonth(end.getMonth() + 1);
    if (planType === "3months") end.setMonth(end.getMonth() + 3);
    if (planType === "6months") end.setMonth(end.getMonth() + 6);
    if (planType === "yearly") end.setFullYear(end.getFullYear() + 1);
    return end;
};

exports.createSubscription = async (req, res) => {
    try {
        const { userId, planId, planType } = req.body;
        if (!userId || !planId || !planType) {
            return res.status(400).json({
                success: false,
                message: "All fields required",
            });
        }
        const activeSub = await Subscription.findOne({
            userId,
            status: "active",
            endDate: { $gt: new Date() },
        });

        if (activeSub) {
            return res.status(400).json({
                success: false,
                message: "Subscription already active",
            });
        }
        const subscription = new Subscription({
            userId,
            planId,
            planType,
            orderId: generateOrderId(),
            transactionId: generateTransactionId(),
            endDate: getEndDate(planType),
        });
        await subscription.save();
        res.status(201).json({
            success: true,
            message: "Subscription created",
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


exports.checkUserSubscriptionStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }
        const subscription = await Subscription.findOne({
            userId,
            status: "active",
        }).sort({ endDate: -1 });
        if (!subscription) {
            return res.status(200).json({
                success: true,
                isActive: false,
            });
        }
        const currentDate = new Date();
        const endDate = new Date(subscription.endDate);

        if (endDate <= currentDate) {
            subscription.status = "completed";
            await subscription.save();

            return res.status(200).json({
                success: true,
                isActive: false,
                endDate: subscription.endDate,
            });
        }

        return res.status(200).json({
            success: true,
            isActive: true,
            endDate: subscription.endDate,
            planType: subscription.planType,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};