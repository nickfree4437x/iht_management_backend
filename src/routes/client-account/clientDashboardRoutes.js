import express from "express";
import {
  getClientActivities,
  getClientDashboardAnalytics
} from "../../controllers/client-account/clientDashboardController.js";

const router = express.Router();

// =========================
// 🔥 CLIENT DASHBOARD ROUTES
// =========================

// 📌 Recent Activities
router.get("/activities/:tourId", getClientActivities);

// 📊 Dashboard Analytics (Charts & Graphs)
router.get("/analytics/:tourId", getClientDashboardAnalytics);

export default router;