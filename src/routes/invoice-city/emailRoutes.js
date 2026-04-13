import express from "express";
import { sendTourPreviewEmail } from "../../controllers/invoice-city/sendTourPreviewEmail.js";

const router = express.Router();

router.post("/send-tour-preview", sendTourPreviewEmail);

export default router;