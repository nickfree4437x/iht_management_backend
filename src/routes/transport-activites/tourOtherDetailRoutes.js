import express from "express";

import {
  getOtherDetails,
  updateOtherDetails
} from "../../controllers/transport-activites/tourOtherDetailController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// 📥 GET OTHER DETAILS
// =========================
router.get("/:tourId", getOtherDetails);

// =========================
// ✏️ UPDATE OTHER DETAILS
// =========================
router.put(
  "/:tourId",
  withActivity(updateOtherDetails, {
    type: "tour_other_details_updated",
    entityType: "tour",
    getMessage: (req) =>
      `Other details updated for tour ${req.params.tourId}`,
  })
);

export default router;