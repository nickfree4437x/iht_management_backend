import express from "express";
import { getCurrentUser, updateProfile } from "../../controllers/realtime-users/userController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);

router.put("/update", protect, updateProfile);

export default router;