import express from "express";

import {
  createGuest,
  getGuests,
  updateGuest,
  deleteGuest
} from "../../controllers/docuemts-guests/guestController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// ➕ CREATE GUEST
// =========================
router.post(
  "/",
  withActivity(createGuest, {
    type: "guest_added",
    entityType: "guest",
    getMessage: (req) =>
      `Guest added: ${req.body.name} (Tour: ${req.body.tourId})`,
  })
);

// =========================
// 📥 GET GUESTS BY TOUR
// =========================
router.get("/:tourId", getGuests);

// =========================
// ✏️ UPDATE GUEST
// =========================
router.put(
  "/:id",
  withActivity(updateGuest, {
    type: "guest_updated",
    entityType: "guest",
    getMessage: (req) =>
      `Guest updated (ID: ${req.params.id})`,
  })
);

// =========================
// ❌ DELETE GUEST
// =========================
router.delete(
  "/:id",
  withActivity(deleteGuest, {
    type: "guest_deleted",
    entityType: "guest",
    getMessage: (req) =>
      `Guest deleted (ID: ${req.params.id})`,
  })
);

export default router;