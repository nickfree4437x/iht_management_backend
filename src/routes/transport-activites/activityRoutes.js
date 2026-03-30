import express from "express";

import {
  getActivities,
  getTourActivities,
  toggleActivityForTour,   // 🔥 NEW (IMPORTANT)
  saveTourActivities,
  createActivity,
  updateActivity,
  deleteActivity
} from "../../controllers/transport-activites/activityController.js";

import uploadActivityImage from "../../middleware/uploadActivityImage.js";
import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Activity Routes (FINAL CLEAN VERSION)
|--------------------------------------------------------------------------
*/

/* =========================
   🧪 TEST ROUTE (DEBUG)
========================= */
router.get("/test", (req, res) => {
  res.json({ message: "Activities API working ✅" });
});


/* =========================
   📥 GET ALL ACTIVITIES
========================= */
router.get("/", getActivities);


/* =========================
   📥 GET ACTIVITIES FOR TOUR
========================= */
router.get("/tour/:tourId", getTourActivities);


/* =========================
   🔥 TOGGLE ACTIVITY (FIXED)
========================= */
router.post(
  "/tour/:tourId",
  withActivity(toggleActivityForTour, {
    type: "tour_activity_toggled",
    entityType: "tour",
    getMessage: (req) =>
      `Activity toggled for tour ${req.params.tourId}`,
  })
);


/* =========================
   💾 BULK SAVE (OPTIONAL)
========================= */
router.post(
  "/tour/:tourId/bulk",
  withActivity(saveTourActivities, {
    type: "tour_activities_updated",
    entityType: "tour",
    getMessage: (req) =>
      `Activities updated for tour ${req.params.tourId}`,
  })
);


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