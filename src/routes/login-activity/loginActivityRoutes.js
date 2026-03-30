import express from "express";
import { getLoginActivity } from "../../controllers/login-actity/loginActivityController.js";

const router = express.Router();

router.get("/login-activity", getLoginActivity);

export default router;