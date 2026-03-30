import express from "express";

import {
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary
} from "../../controllers/docuemts-guests/itineraryController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// 📥 GET ITINERARY BY TOUR
// =========================
router.get("/:tourId", getItinerary);

// =========================
// ➕ CREATE ITINERARY
// =========================
router.post(
  "/",
  withActivity(createItinerary, {
    type: "itinerary_created",
    entityType: "itinerary",
    getMessage: (req) =>
      `Itinerary created for tour ${req.body.tourId}`,
  })
);

// =========================
// ✏️ UPDATE ITINERARY
// =========================
router.put(
  "/:id",
  withActivity(updateItinerary, {
    type: "itinerary_updated",
    entityType: "itinerary",
    getMessage: (req) =>
      `Itinerary updated (ID: ${req.params.id})`,
  })
);

// =========================
// ❌ DELETE ITINERARY
// =========================
router.delete(
  "/:id",
  withActivity(deleteItinerary, {
    type: "itinerary_deleted",
    entityType: "itinerary",
    getMessage: (req) =>
      `Itinerary deleted (ID: ${req.params.id})`,
  })
);

export default router;