import express from "express";
import {
  getAllActivities,
  broadcastActivity,
  getRealtimeStats,
  getRealtimeNotifications,
  clearAllActivities,
} from "../../controllers/realtime-users/realTimeUpdateController.js";

const router = express.Router();

// =========================
// 📥 GET ACTIVITIES
// =========================
router.get("/activities", getAllActivities);

// =========================
// 🔴 BROADCAST ACTIVITY
// =========================
router.post("/activities/broadcast", broadcastActivity);

// =========================
// 📊 DASHBOARD STATS
// =========================
router.get("/stats", getRealtimeStats);

// =========================
// 🔔 GET NOTIFICATIONS
// =========================
router.get("/notifications", getRealtimeNotifications);

// =========================
// 🧹 CLEAR ACTIVITIES
// =========================
router.delete("/activities", clearAllActivities);

export default router;