import express from "express";

import {
  getTransportsByTour,
  addTransport,
  updateTransport,
  deleteTransport,
  getTransportsByDriver // ✅ NEW IMPORT
} from "../../controllers/transport-activites/transportController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// 📥 GET TRANSPORTS BY TOUR
// =========================
router.get("/:tourId", getTransportsByTour);

// =========================
// 🔥 GET TRANSPORTS BY DRIVER (NEW)
// =========================
router.get("/driver/:driverId", getTransportsByDriver);

// =========================
// ➕ ADD TRANSPORT
// =========================
router.post(
  "/",
  withActivity(addTransport, {
    type: "transport_added",
    entityType: "transport",
    getMessage: (req) =>
      `Transport added for tour ${req.body.tourId} (${req.body.from} → ${req.body.to})`,
  })
);

// =========================
// ✏️ UPDATE TRANSPORT
// =========================
router.put(
  "/:id",
  withActivity(updateTransport, {
    type: "transport_updated",
    entityType: "transport",
    getMessage: (req) =>
      `Transport updated (ID: ${req.params.id})`,
  })
);

// =========================
// ❌ DELETE TRANSPORT
// =========================
router.delete(
  "/:id",
  withActivity(deleteTransport, {
    type: "transport_deleted",
    entityType: "transport",
    getMessage: (req) =>
      `Transport deleted (ID: ${req.params.id})`,
  })
);

export default router;