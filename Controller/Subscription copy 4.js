const Subscription = require("../Model/Subscription");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: "rzp_test_JOC0wRKpLH1cVW",
    key_secret: "9EzSlxvJbTyQ2Hg0Us5ZX4VD",
});

const getEndDate = (planType) => {
    const now = new Date();
    if (planType === "monthly") {
        now.setMonth(now.getMonth() + 1);
    } else if (planType === "yearly") {
        now.setFullYear(now.getFullYear() + 1);
    } else {
        now.setDate(now.getDate() + 7);
    }
    return now;
};

exports.createPaymentLink = async (req, res) => {
    try {
        const { userId, planId, planType, amount, name, email, contact } = req.body;

        if (!userId || !planId || !planType || !amount) {
            return res.status(400).json({
                success: false,
                message: "userId, planId, planType, amount required",
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
                message: "Active subscription already exists",
            });
        }

        const paymentLink = await razorpay.paymentLink.create({
            amount: amount * 100,
            currency: "INR",
            description: `Subscription - ${planType}`,
            customer: {
                name: name || "User",
                email: email || "test@gmail.com",
                contact: contact || "9999999999",
            },
            notify: { sms: true, email: true },

            callback_url: "http://localhost:8002/api/subscription/verify-payment-link",
            callback_method: "get",

            notes: {
                userId: userId.toString(),
                planId: planId.toString(),
                planType,
                amount: amount.toString(),
            },
        });

        res.json({
            success: true,
            checkout_url: paymentLink.short_url,
            payment_link_id: paymentLink.id,
        });
    } catch (err) {
        console.error("Create Payment Link Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};



// exports.verifyPaymentLink = async (req, res) => {
//     try {
//         const {
//             razorpay_payment_link_id,
//             razorpay_payment_link_status,
//             razorpay_payment_id,
//         } = req.query;

//         if (!razorpay_payment_link_id) {
//             return res.redirect(
//                 "http://localhost:3000/payment-failure?reason=invalid_request"
//             );
//         }

//         // ✅ Fetch payment link from Razorpay (SOURCE OF TRUTH)
//         const paymentLink = await razorpay.paymentLink.fetch(
//             razorpay_payment_link_id
//         );

//         if (!paymentLink || paymentLink.status !== "paid") {
//             return res.redirect(
//                 "http://localhost:3000/payment-failure?reason=payment_not_paid"
//             );
//         }

//         // ✅ Extract notes safely
//         const { userId, planId, planType, amount } = paymentLink.notes;

//         if (!userId || !planType || !amount) {
//             return res.redirect(
//                 "http://localhost:3000/payment-failure?reason=missing_data"
//             );
//         }

//         // ❌ Prevent duplicate subscription
//         const existingActive = await Subscription.findOne({
//             userId,
//             status: "active",
//             endDate: { $gt: new Date() },
//         });

//         if (existingActive) {
//             return res.redirect(
//                 "http://localhost:3000/payment-failure?reason=already_subscribed"
//             );
//         }

//         // 🟢 Create subscription
//         const subscription = new Subscription({
//             userId,
//             planId,
//             planType,
//             amount: Number(amount),
//             orderId: razorpay_payment_link_id,
//             transactionId: razorpay_payment_id || null,
//             endDate: getEndDate(planType),
//             status: "active",
//         });

//         await subscription.save();

//         return res.redirect(
//             `http://localhost:3000/payment-success?subscriptionId=${subscription._id}`
//         );

//     } catch (err) {
//         console.error("Verify Payment Link Error:", err);
//         return res.redirect(
//             "http://localhost:3000/payment-failure?reason=server_error"
//         );
//     }
// };

exports.verifyPaymentLink = async (req, res) => {
    try {
        const {
            razorpay_payment_link_id,
            razorpay_payment_id,
        } = req.query;

        if (!razorpay_payment_link_id) {
            return res.redirect("myapp://payment-failure");
        }

        const paymentLink = await razorpay.paymentLink.fetch(
            razorpay_payment_link_id
        );

        if (!paymentLink || paymentLink.status !== "paid") {
            return res.redirect("myapp://payment-failure");
        }

        const { userId, planId, planType, amount } = paymentLink.notes || {};

        if (!userId || !planType || !amount) {
            return res.redirect("myapp://payment-failure");
        }

        const existingActive = await Subscription.findOne({
            userId,
            status: "active",
            endDate: { $gt: new Date() },
        });

        if (existingActive) {
            return res.redirect("myapp://payment-failure");
        }

        const subscription = new Subscription({
            userId,
            planId,
            planType,
            amount: Number(amount),
            orderId: razorpay_payment_link_id,
            transactionId: razorpay_payment_id || null,
            endDate: getEndDate(planType),
            status: "active",
        });

        await subscription.save();

        return res.redirect(
            "myapp://payment-success"
        );

    } catch (err) {
        console.error("Verify Payment Link Error:", err);
        return res.redirect("myapp://payment-failure");
    }
};




exports.verifyPaymentAndCreateSubscription = async (req, res) => {

    try {
        const { payment_link_id } = req.body;
        const paymentLink = await razorpay.paymentLink.fetch(payment_link_id);

        if (!paymentLink || paymentLink.status !== "paid") {
            return res.status(400).json({ success: false, message: "Payment not completed" });
        }

        const { userId, planId, planType, amount } = paymentLink.notes;

        const subscription = new Subscription({
            userId,
            planId,
            planType,
            amount,
            orderId: paymentLink.id,
            transactionId: paymentLink.payments[0]?.payment_id || null,
            endDate: getEndDate(planType),
            status: "active",
        });

        await subscription.save();

        res.json({ success: true, message: "Subscription activated", data: subscription });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.checkUserSubscriptionStatus = async (req, res) => {
    const sub = await Subscription.findOne({
        userId: req.params.userId,
        status: "active",
    }).sort({ endDate: -1 });

    if (!sub) {
        return res.json({ success: true, isActive: false });
    }

    if (sub.endDate <= new Date()) {
        sub.status = "completed";
        await sub.save();
        return res.json({ success: true, isActive: false, expired: true });
    }

    res.json({
        success: true,
        isActive: true,
        planType: sub.planType,
        endDate: sub.endDate,
        amount: sub.amount,
    });
};