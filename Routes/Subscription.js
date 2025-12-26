const express = require("express");
const router = express.Router();
const sub = require("../Controller/Subscription");

// router.post("/create-payment-link", sub.createPaymentLink);
// router.get("/verify-payment-link", sub.verifyPaymentLink);
router.post("/create-payment", sub.createPaymentLinkPost);
router.post("/verify-payment", sub.verifyPaymentPost);
router.post("/verify-payment", sub.verifyPaymentAndCreateSubscription);
router.get("/check/:userId", sub.checkUserSubscriptionStatus);

module.exports = router;