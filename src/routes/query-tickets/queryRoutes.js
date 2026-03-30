import express from "express";

import {
  createQuery,
  getQueriesByTour,
  updateQuery,
  deleteQuery,
  answerQuery,
  completeQuery
} from "../../controllers/query-tickets/queryController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// ➕ CREATE QUERY (Team)
// =========================
router.post(
  "/",
  withActivity(createQuery, {
    type: "query_created",
    entityType: "query",
    getMessage: (req) =>
      `New query created for tour ${req.body.tourId}`,
  })
);

// =========================
// 📥 GET QUERIES BY TOUR
// =========================
router.get("/:tourId", getQueriesByTour);

// =========================
// ✏️ UPDATE QUERY
// =========================
router.put(
  "/:id",
  withActivity(updateQuery, {
    type: "query_updated",
    entityType: "query",
    getMessage: (req) =>
      `Query updated (ID: ${req.params.id})`,
  })
);

// =========================
// 💬 ANSWER QUERY (Client)
// =========================
router.put(
  "/:id/answer",
  withActivity(answerQuery, {
    type: "query_answered",
    entityType: "query",
    getMessage: (req) =>
      `Query answered (ID: ${req.params.id})`,
  })
);

// =========================
// ✅ MARK QUERY COMPLETED
// =========================
router.put(
  "/:id/complete",
  withActivity(completeQuery, {
    type: "query_completed",
    entityType: "query",
    getMessage: (req) =>
      `Query marked as completed (ID: ${req.params.id})`,
  })
);

// =========================
// ❌ DELETE QUERY
// =========================
router.delete(
  "/:id",
  withActivity(deleteQuery, {
    type: "query_deleted",
    entityType: "query",
    getMessage: (req) =>
      `Query deleted (ID: ${req.params.id})`,
  })
);

export default router;