import express from "express";

import {
  teamLogin,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword
} from "../../controllers/auth/authController.js";

// ✅ IMPORT MIDDLEWARE
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Team Login (Email + Password)
router.post("/team-login", teamLogin);

// 🔄 Refresh Access Token (with rotation)
router.post("/refresh-token", refreshAccessToken);

// 🚪 Logout
router.post("/logout", logout);

// 🔑 Forgot Password
router.post("/forgot-password", forgotPassword);

// 🔁 Reset Password
router.post("/reset-password", resetPassword);

// 🔥 CHANGE PASSWORD (FIXED)
router.put("/change-password", protect, changePassword);

export default router;