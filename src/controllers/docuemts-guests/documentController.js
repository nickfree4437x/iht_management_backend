import prisma from "../../config/prisma.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import axios from "axios";
import { createActivityAndEmit } from "../../utils/activityHelper.js"; // 🔥 ADD

// =========================
// ✅ ALLOWED FILE TYPES
// =========================
const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// =========================
// ✅ SAFE RESOURCE TYPE
// =========================
const getResourceType = (mime) => {
  if (!mime || typeof mime !== "string") return "raw";
  return mime.startsWith("image/") ? "image" : "raw";
};

// =========================
// ✅ CLOUDINARY UPLOAD HELPER
// =========================
const uploadToCloudinary = (fileBuffer, folder, resourceType) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// =========================
// 📄 UPLOAD DOCUMENT
// =========================
export const uploadDocument = async (req, res, next) => {
  try {
    const { tourId, documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    const resourceType = getResourceType(req.file.mimetype);

    const result = await uploadToCloudinary(
      req.file.buffer,
      `tour_documents/${tourId}`,
      resourceType
    );

    const document = await prisma.document.create({
      data: {
        fileName: req.file.originalname,
        filePath: result.secure_url,
        publicId: result.public_id,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        documentType: documentType || "Other",
        tourId,
      },
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "document",
      message: `${documentType || "Document"} uploaded`,
      tourId,
    });

    res.status(201).json({
      success: true,
      document,
    });

  } catch (error) {
    next(error);
  }
};

// =========================
// 📥 GET DOCUMENTS BY TOUR (UNCHANGED)
// =========================
export const getDocumentsByTour = async (req, res, next) => {
  try {
    const { tourId } = req.params;

    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: "Tour ID is required",
      });
    }

    const documents = await prisma.document.findMany({
      where: {
        tourId: String(tourId),
      },
      orderBy: { uploadedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });

  } catch (error) {
    console.error("GET DOCUMENT ERROR:", error);
    next(error);
  }
};

// =========================
// ⬇ DOWNLOAD DOCUMENT (UNCHANGED)
// =========================
export const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const response = await axios({
      url: document.filePath,
      method: "GET",
      responseType: "stream",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.fileName}"`
    );

    res.setHeader("Content-Type", document.fileType || "application/octet-stream");

    response.data.pipe(res);

  } catch (error) {
    next(error);
  }
};

// =========================
// 🔄 REPLACE DOCUMENT
// =========================
export const replaceDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const oldResourceType = getResourceType(existingDocument.fileType);

    if (existingDocument.publicId) {
      await cloudinary.uploader.destroy(existingDocument.publicId, {
        resource_type: oldResourceType,
      });
    }

    const newResourceType = getResourceType(req.file.mimetype);

    const result = await uploadToCloudinary(
      req.file.buffer,
      `tour_documents/${existingDocument.tourId}`,
      newResourceType
    );

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        fileName: req.file.originalname,
        filePath: result.secure_url,
        publicId: result.public_id,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      },
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "document",
      message: "Document replaced",
      tourId: existingDocument.tourId,
    });

    res.json({
      success: true,
      message: "Document replaced successfully",
      document: updatedDocument,
    });

  } catch (error) {
    next(error);
  }
};

// =========================
// ❌ DELETE DOCUMENT
// =========================
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const resourceType = getResourceType(document.fileType);

    if (document.publicId) {
      await cloudinary.uploader.destroy(document.publicId, {
        resource_type: resourceType,
      });
    }

    await prisma.document.delete({
      where: { id },
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "document",
      message: "Document deleted",
      tourId: document.tourId,
    });

    res.json({
      success: true,
      message: "Document deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};