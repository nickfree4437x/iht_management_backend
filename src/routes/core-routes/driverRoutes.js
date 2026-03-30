import express from "express";
import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  setActiveDriver,      // 🔥 NEW
  getActiveDriver       // 🔥 NEW
} from "../../controllers/core-controllers/driverController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// =========================
// ➕ CREATE DRIVER
// =========================
router.post(
  "/",
  withActivity(createDriver, {
    type: "driver_created",
    entityType: "driver",
    getMessage: (req) =>
      `New driver created: ${req.body.name}`,
  })
);

// =========================
// 📥 GET ALL DRIVERS
// =========================
router.get("/", getDrivers);

// =========================
// 📥 GET SINGLE DRIVER
// =========================
router.get("/:id", getDriverById);

// =========================
// ✏️ UPDATE DRIVER
// =========================
router.put(
  "/:id",
  withActivity(updateDriver, {
    type: "driver_updated",
    entityType: "driver",
    getMessage: (req) =>
      `Driver updated (ID: ${req.params.id})`,
  })
);

// =========================
// ❌ DELETE DRIVER
// =========================
router.delete(
  "/:id",
  withActivity(deleteDriver, {
    type: "driver_deleted",
    entityType: "driver",
    getMessage: (req) =>
      `Driver deleted (ID: ${req.params.id})`,
  })
);


/* =========================
   🔥 ACTIVE DRIVER ROUTES
========================= */

// 👉 Set Active Driver (Team Portal)
router.patch(
  "/tour/:tourId/driver",
  withActivity(setActiveDriver, {
    type: "active_driver_set",
    entityType: "tour",
    getMessage: (req) =>
      `Active driver set for tour ${req.params.tourId}`,
  })
);

// 👉 Get Active Driver (Client)
router.get(
  "/tour/:tourId/driver",
  getActiveDriver
);

export default router;