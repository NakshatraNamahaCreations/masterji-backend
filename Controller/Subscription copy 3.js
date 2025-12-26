// const Razorpay = require("razorpay");

// const razorpay = new Razorpay({
//     key_id: "rzp_test_JOC0wRKpLH1cVW",
//     key_secret: "9EzSlxvJbTyQ2Hg0Us5ZX4VD",
// });

// exports.createPaymentLink = async (req, res) => {
//     try {
//         const { amount, name, email, contact } = req.body;

//         const paymentLink = await razorpay.paymentLink.create({
//             amount: amount * 100,
//             currency: "INR",
//             accept_partial: false,
//             description: "Subscription Payment",
//             customer: {
//                 name: name || "Test User",
//                 email: email || "test@example.com",
//                 contact: contact || "9999999999",
//             },
//             notify: {
//                 sms: true,
//                 email: true,
//             },
//             callback_url: "http://localhost:3000/payment-success",
//             callback_method: "get",
//         });

//         return res.status(200).json({
//             success: true,
//             payment_link_id: paymentLink.id,
//             checkout_url: paymentLink.short_url,
//             status: paymentLink.status,
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };



const Subscription = require("../Model/Subscription");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: "rzp_test_JOC0wRKpLH1cVW",
    key_secret: "9EzSlxvJbTyQ2Hg0Us5ZX4VD",
});

exports.createPaymentLink = async (req, res) => {
    try {
        const { userId, planId, planType, amount, name, email, contact } = req.body;

        if (!userId || !planId || !planType || !amount) {
            return res.status(400).json({
                success: false,
                message: "userId, planId, planType, amount required",
            });
        }

        // ❌ block if active subscription exists
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

            callback_url: "http://localhost:3000/payment-success",
            callback_method: "get",

            notes: {
                userId,
                planId,
                planType,
                amount,
            },
        });

        res.json({
            success: true,
            checkout_url: paymentLink.short_url,
            payment_link_id: paymentLink.id,
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.verifyPaymentAndCreateSubscription = async (req, res) => {
    try {
        const { payment_link_id } = req.body;

        const paymentLink = await razorpay.paymentLink.fetch(payment_link_id);

        if (!paymentLink || paymentLink.status !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Payment not completed",
            });
        }

        const { userId, planId, planType, amount } = paymentLink.notes;

        const subscription = new Subscription({
            userId,
            planId,
            planType,
            amount,
            orderId: paymentLink.id,
            transactionId: paymentLink.payments[0].payment_id,
            endDate: getEndDate(planType),
        });

        await subscription.save();

        res.json({
            success: true,
            message: "Subscription activated",
            data: subscription,
        });

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

        return res.json({
            success: true,
            isActive: false,
            expired: true,
        });
    }

    res.json({
        success: true,
        isActive: true,
        planType: sub.planType,
        endDate: sub.endDate,
        amount: sub.amount,
    });
};
