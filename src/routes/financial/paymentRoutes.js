import express from "express";

import {
  getTourPayments,
  createPayment,
  updatePayment,
  deletePayment,
  getAdvisorRecentPayments // ✅ NEW IMPORT
} from "../../controllers/financial/paymentController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

/* --------------------------------------- */
/* 📥 GET PAYMENTS OF A TOUR */
/* --------------------------------------- */
router.get("/tour/:id", getTourPayments);

/* --------------------------------------- */
/* 🆕 GET RECENT PAYMENTS BY ADVISOR */
/* --------------------------------------- */
router.get("/advisor/:id", getAdvisorRecentPayments); // ✅ NEW ROUTE

/* --------------------------------------- */
/* ➕ CREATE PAYMENT */
/* --------------------------------------- */
router.post(
  "/",
  withActivity(createPayment, {
    type: "payment_created",
    entityType: "payment",
    getMessage: (req) =>
      `Payment added for tour ${req.body.tourId} (₹${req.body.amount})`,
  })
);

/* --------------------------------------- */
/* ✏️ UPDATE PAYMENT */
/* --------------------------------------- */
router.put(
  "/:id",
  withActivity(updatePayment, {
    type: "payment_updated",
    entityType: "payment",
    getMessage: (req) =>
      `Payment updated (ID: ${req.params.id})`,
  })
);


/* --------------------------------------- */
/* ❌ DELETE PAYMENT */
/* --------------------------------------- */
router.delete(
  "/:id",
  withActivity(deletePayment, {
    type: "payment_deleted",
    entityType: "payment",
    getMessage: (req) =>
      `Payment deleted (ID: ${req.params.id})`,
  })
);

export default router;