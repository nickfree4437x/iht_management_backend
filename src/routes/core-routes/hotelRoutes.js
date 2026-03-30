import express from "express";
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getHotelTours,
  getHotelStats
} from "../../controllers/core-controllers/hotelController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// 🏨 CREATE HOTEL
// =========================
router.post(
  "/",
  withActivity(createHotel, {
    type: "hotel_created",
    entityType: "hotel",
    getMessage: (req) => `New hotel created: ${req.body.name}`,
  })
);

// =========================
// 📥 GET ALL HOTELS
// =========================
router.get("/", getHotels);

// =========================
// 📥 GET SINGLE HOTEL
// =========================
router.get("/:id", getHotelById);

// =========================
// 📥 GET TOURS USING HOTEL
// =========================
router.get("/:id/tours", getHotelTours);

// =========================
// ✏️ UPDATE HOTEL
// =========================
router.put(
  "/:id",
  withActivity(updateHotel, {
    type: "hotel_updated",
    entityType: "hotel",
    getMessage: (req) => `Hotel updated (ID: ${req.params.id})`,
  })
);

// =========================
// ❌ DELETE HOTEL
// =========================
router.delete(
  "/:id",
  withActivity(deleteHotel, {
    type: "hotel_deleted",
    entityType: "hotel",
    getMessage: (req) => `Hotel deleted (ID: ${req.params.id})`,
  })
);

// =========================
// 📊 HOTEL STATS
// =========================
router.get("/:id/stats", getHotelStats);

export default router;