import express from "express";

import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getHotelTours,
  getHotelStats,

  createHotelVoucher,
  getHotelVouchers,
  updateHotelVoucher,
  deleteHotelVoucher

} from "../../controllers/core-controllers/hotelController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();


// ======================================================
// 🏨 HOTEL ROUTES
// ======================================================


// =========================
// 🏨 CREATE HOTEL
// =========================
router.post(
  "/",
  withActivity(createHotel, {
    type: "hotel_created",
    entityType: "hotel",

    getMessage: (req) =>
      `New hotel created: ${req.body.name}`,
  })
);


// =========================
// 📥 GET ALL HOTELS
// =========================
router.get("/", getHotels);



// ======================================================
// 🧾 HOTEL VOUCHER ROUTES
// ======================================================


// =========================
// 🧾 CREATE HOTEL VOUCHER
// =========================
router.post(
  "/voucher",

  withActivity(createHotelVoucher, {

    type: "hotel_voucher_created",

    entityType: "hotel_voucher",

    getMessage: (req) =>
      `Hotel voucher created for ${req.body.clientName}`,

  })
);


// =========================
// 📊 GET HOTEL VOUCHERS
// =========================
router.get(
  "/voucher/all",
  getHotelVouchers
);


// =========================
// ✏️ UPDATE HOTEL VOUCHER
// =========================
router.put(
  "/voucher/:id",

  withActivity(updateHotelVoucher, {

    type: "hotel_voucher_updated",

    entityType: "hotel_voucher",

    getMessage: (req) =>
      `Hotel voucher updated for ${req.body.clientName}`,

  })
);


// =========================
// ❌ DELETE HOTEL VOUCHER
// =========================
router.delete(
  "/voucher/:id",

  withActivity(deleteHotelVoucher, {

    type: "hotel_voucher_deleted",

    entityType: "hotel_voucher",

    getMessage: () =>
      `Hotel voucher deleted`,

  })
);



// ======================================================
// 📊 HOTEL EXTRA ROUTES
// ======================================================


// =========================
// 📊 HOTEL STATS
// =========================
router.get(
  "/:id/stats",
  getHotelStats
);


// =========================
// 📥 GET TOURS USING HOTEL
// =========================
router.get(
  "/:id/tours",
  getHotelTours
);



// ======================================================
// 🏨 SINGLE HOTEL ROUTES
// ======================================================


// =========================
// 📥 GET SINGLE HOTEL
// =========================
router.get(
  "/:id",
  getHotelById
);


// =========================
// ✏️ UPDATE HOTEL
// =========================
router.put(
  "/:id",

  withActivity(updateHotel, {

    type: "hotel_updated",

    entityType: "hotel",

    getMessage: (req) =>
      `Hotel updated (ID: ${req.params.id})`,

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

    getMessage: (req) =>
      `Hotel deleted (ID: ${req.params.id})`,

  })
);


export default router;