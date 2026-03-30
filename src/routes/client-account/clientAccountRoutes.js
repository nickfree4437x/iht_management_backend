import express from "express";

import {
  generateClientAccount,
  clientLogin,
  forgotPassword,
  resetPassword,
  getClientProfile, // ✅ add this
  changePassword
} from "../../controllers/client-account/clientAccountController.js";

import authClient from "../../middleware/authClient.js";

const router = express.Router();

// 🟢 Generate Account
router.post("/generate", generateClientAccount);

// 🔵 Login
router.post("/login", clientLogin);

// 🟡 Forgot Password
router.post("/forgot-password", forgotPassword);

// 🔴 Reset Password
router.post("/reset-password/:token", resetPassword);

// 🟣 Get Profile (PROTECTED 🔥)
router.get("/profile", authClient, getClientProfile);

router.put("/change-password", authClient, changePassword);

export default router;