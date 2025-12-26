const express = require("express");
const router = express.Router();
const planController = require("../Controller/Plan");

router.post("/addplan", planController.addPlan);
router.get("/getplan", planController.getPlans);
router.get("/plan-by-id/:id", planController.getPlanById);
router.put("/updateplan/:id", planController.updatePlan);
router.delete("/deleteplan/:id", planController.deletePlan);

module.exports = router;
