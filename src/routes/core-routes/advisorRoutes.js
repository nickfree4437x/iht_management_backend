import express from "express";

import uploadAdvisor from "../../middleware/uploadAdvisor.js";
import { validateAdvisor } from "../../middleware/validateAdvisor.js";

import {
  createAdvisor,
  getAdvisors,
  getAdvisorById,
  updateAdvisor,
  deleteAdvisor
} from "../../controllers/core-controllers/advisorController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// ➕ CREATE ADVISOR
// =========================
router.post(
  "/",
  uploadAdvisor.single("photo"),
  validateAdvisor,
  withActivity(createAdvisor, {
    type: "advisor_created",
    entityType: "advisor",
    getMessage: (req) =>
      `New advisor created: ${req.body.name}`,
  })
);

// =========================
// 📥 GET ALL ADVISORS
// =========================
router.get("/", getAdvisors);

// =========================
// 📥 GET SINGLE ADVISOR
// =========================
router.get("/:id", getAdvisorById);

// =========================
// ✏️ UPDATE ADVISOR
// =========================
router.put(
  "/:id",
  uploadAdvisor.single("photo"),
  validateAdvisor,
  withActivity(updateAdvisor, {
    type: "advisor_updated",
    entityType: "advisor",
    getMessage: (req) =>
      `Advisor updated (ID: ${req.params.id})`,
  })
);

// =========================
// ❌ DELETE ADVISOR
// =========================
router.delete(
  "/:id",
  withActivity(deleteAdvisor, {
    type: "advisor_deleted",
    entityType: "advisor",
    getMessage: (req) =>
      `Advisor deleted (ID: ${req.params.id})`,
  })
);

export default router;