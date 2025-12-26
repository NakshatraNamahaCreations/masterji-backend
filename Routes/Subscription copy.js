const express = require("express");
const router = express.Router();
const subscriptionController = require("../Controller/Subscription");

router.post("/createsub", subscriptionController.createSubscription);
router.get("/getallsub", subscriptionController.getAllSubscriptions);
router.get("/getsub/:id", subscriptionController.getSubscriptionById);
router.get("/usersub/:userId", subscriptionController.getSubscriptionByUserId);
router.delete("/deletesub/:id", subscriptionController.deleteSubscription);
router.get("/check/:userId", subscriptionController.checkUserSubscriptionStatus);


module.exports = router;
