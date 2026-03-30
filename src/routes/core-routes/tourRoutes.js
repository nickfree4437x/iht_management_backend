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
  getTourById
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

// 🔥 Already enriched (hasHotel, hasTransport, hasPayment)
router.get("/upcoming", getUpcomingTours);
router.get("/previous", getPreviousTours);

// Trash list (no change)
router.get("/trash", getTrashTours);

/* ---------------- TRASH SYSTEM ---------------- */

// Move to Trash
router.patch(
  "/:id/trash",
  withActivity(moveToTrash, {
    type: "tour_trashed",
    entityType: "tour",
    getMessage: (req) =>
      `Tour moved to trash (ID: ${req.params.id})`,
  })
);

// Restore Tour
router.patch(
  "/:id/restore",
  withActivity(restoreTour, {
    type: "tour_restored",
    entityType: "tour",
    getMessage: (req) =>
      `Tour restored (ID: ${req.params.id})`,
  })
);

// Delete Forever
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

// 🔥 Single tour (no change needed)
router.get("/:id", getTourById);

export default router;