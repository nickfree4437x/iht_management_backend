import express from "express";
import {
  getDashboardStats,
} from "../../controllers/core-controllers/dashboardController.js";

const router = express.Router();

// =========================
// 📊 DASHBOARD
// =========================
router.get("/", getDashboardStats);


export default router;