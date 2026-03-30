import express from "express";

import {
  addAdditionalCost,
  getAdditionalCosts,
  updateAdditionalCost,
  deleteAdditionalCost,
} from "../../controllers/financial/additionalCostController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// ➕ ADD ADDITIONAL COST
// =========================
router.post(
  "/",
  withActivity(addAdditionalCost, {
    type: "additional_cost_added",
    entityType: "tour",
    getMessage: (req) =>
      `Additional cost added for tour ${req.body.tourId}`,
  })
);

// =========================
// 📥 GET COSTS BY TOUR
// =========================
router.get("/:tourId", getAdditionalCosts);

// =========================
// ✏️ UPDATE ADDITIONAL COST
// =========================
router.put(
  "/:id",
  withActivity(updateAdditionalCost, {
    type: "additional_cost_updated",
    entityType: "additional_cost",
    getMessage: (req) =>
      `Additional cost updated (ID: ${req.params.id})`,
  })
);

// =========================
// ❌ DELETE ADDITIONAL COST
// =========================
router.delete(
  "/:id",
  withActivity(deleteAdditionalCost, {
    type: "additional_cost_deleted",
    entityType: "additional_cost",
    getMessage: (req) =>
      `Additional cost deleted (ID: ${req.params.id})`,
  })
);

export default router;