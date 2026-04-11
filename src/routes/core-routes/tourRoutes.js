import express from "express";

import {
  createTour,
  getUpcomingTours,
  getPreviousTours,
  getTrashTours,
  moveToTrash,
  restoreTour,
  deleteForever,
  getAdvisorTours,
  getTourById,
  getOngoingTours,
  updateTour // ✅ NEW IMPORT
} from "../../controllers/core-controllers/tourController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

/* ---------------- CREATE TOUR ---------------- */

router.post(
  "/",
  withActivity(createTour, {
    type: "tour_created",
    entityType: "tour",
    getMessage: (req) =>
      `New tour created: ${req.body.tourName}`,
  })
);

/* ---------------- TOUR LISTS ---------------- */

router.get("/upcoming", getUpcomingTours);
router.get("/previous", getPreviousTours);
router.get("/ongoing", getOngoingTours);
router.get("/trash", getTrashTours);

/* ---------------- UPDATE TOUR (✅ NEW) ---------------- */

// ✅ IMPORTANT: placed before /:id route
router.put(
  "/:id",
  withActivity(updateTour, {
    type: "tour_updated",
    entityType: "tour",
    getMessage: (req) =>
      `Tour updated (ID: ${req.params.id})`,
  })
);

/* ---------------- TRASH SYSTEM ---------------- */

router.patch(
  "/:id/trash",
  withActivity(moveToTrash, {
    type: "tour_trashed",
    entityType: "tour",
    getMessage: (req) =>
      `Tour moved to trash (ID: ${req.params.id})`,
  })
);

router.patch(
  "/:id/restore",
  withActivity(restoreTour, {
    type: "tour_restored",
    entityType: "tour",
    getMessage: (req) =>
      `Tour restored (ID: ${req.params.id})`,
  })
);

router.delete(
  "/:id/delete",
  withActivity(deleteForever, {
    type: "tour_deleted_permanently",
    entityType: "tour",
    getMessage: (req) =>
      `Tour permanently deleted (ID: ${req.params.id})`,
  })
);

/* ---------------- OTHER ROUTES ---------------- */

router.get("/advisor/:id", getAdvisorTours);

// 🔥 KEEP LAST (IMPORTANT)
router.get("/:id", getTourById);

export default router;