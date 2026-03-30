import express from "express";
import upload from "../../middleware/uploadDocument.js";

import {
  uploadDocument,
  getDocumentsByTour,
  deleteDocument,
  replaceDocument,
  downloadDocument,
} from "../../controllers/docuemts-guests/documentController.js";

import { withActivity } from "../../utils/withActivity.js";

const router = express.Router();

// 📄 UPLOAD
router.post(
  "/upload",
  upload.single("file"),
  withActivity(uploadDocument, {
    type: "document_uploaded",
    entityType: "document",
    getMessage: (req) =>
      `Document uploaded for tour ${req.body.tourId || "unknown"}`,
  })
);

// ⬇ DOWNLOAD
router.get("/download/:id", downloadDocument);

// 🔄 REPLACE
router.put(
  "/replace/:id",
  upload.single("file"),
  withActivity(replaceDocument, {
    type: "document_replaced",
    entityType: "document",
    getMessage: (req) =>
      `Document replaced (ID: ${req.params.id})`,
  })
);

// ❌ DELETE
router.delete(
  "/:id",
  withActivity(deleteDocument, {
    type: "document_deleted",
    entityType: "document",
    getMessage: (req) =>
      `Document deleted (ID: ${req.params.id})`,
  })
);

// 📥 GET BY TOUR (FIXED)
router.get("/tour/:tourId", getDocumentsByTour);

export default router;