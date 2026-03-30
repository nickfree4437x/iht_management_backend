import express from "express";
import uploadTicket from "../../middleware/uploadTicket.js";

import {
  createTicket,
  getTicketsByTour,
  updateTicket,
  deleteTicket
} from "../../controllers/query-tickets/travelTicketController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// ➕ CREATE TICKET
// =========================
router.post(
  "/",
  uploadTicket.single("image"),
  withActivity(createTicket, {
    type: "ticket_created",
    entityType: "travel_ticket",
    getMessage: (req) =>
      `Ticket added for tour ${req.body.tourId} (${req.body.from} → ${req.body.to})`,
  })
);

// =========================
// 📥 GET TICKETS BY TOUR
// =========================
router.get("/:tourId", getTicketsByTour);

// =========================
// ✏️ UPDATE TICKET
// =========================
router.put(
  "/:id",
  uploadTicket.single("image"),
  withActivity(updateTicket, {
    type: "ticket_updated",
    entityType: "travel_ticket",
    getMessage: (req) =>
      `Ticket updated (ID: ${req.params.id})`,
  })
);

// =========================
// ❌ DELETE TICKET
// =========================
router.delete(
  "/:id",
  withActivity(deleteTicket, {
    type: "ticket_deleted",
    entityType: "travel_ticket",
    getMessage: (req) =>
      `Ticket deleted (ID: ${req.params.id})`,
  })
);

export default router;