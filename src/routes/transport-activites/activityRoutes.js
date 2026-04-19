import express from "express";

import {
  getActivities,
  getTourActivities,
  createActivity,
  updateActivity,
  deleteActivity
} from "../../controllers/transport-activites/activityController.js";

import uploadActivityImage from "../../middleware/uploadActivityImage.js";
import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

/* =========================
   📥 GET ACTIVITIES (BY TOUR)
========================= */
router.get("/", getActivities);


/* =========================
   📥 GET ACTIVITIES FOR TOUR (OPTIONAL)
========================= */
router.get("/tour/:tourId", getTourActivities);


/* =========================
   ➕ CREATE ACTIVITY
========================= */
router.post(
  "/",
  uploadActivityImage.single("image"),
  withActivity(createActivity, {
    type: "activity_created",
    entityType: "activity",
    getMessage: (req) =>
      `New activity created: ${req.body.name}`,
  })
);


/* =========================
   ✏️ UPDATE ACTIVITY
========================= */
router.put(
  "/:id",
  uploadActivityImage.single("image"),
  withActivity(updateActivity, {
    type: "activity_updated",
    entityType: "activity",
    getMessage: (req) =>
      `Activity updated (ID: ${req.params.id})`,
  })
);


/* =========================
   ❌ DELETE ACTIVITY
========================= */
router.delete(
  "/:id",
  withActivity(deleteActivity, {
    type: "activity_deleted",
    entityType: "activity",
    getMessage: (req) =>
      `Activity deleted (ID: ${req.params.id})`,
  })
);

export default router;