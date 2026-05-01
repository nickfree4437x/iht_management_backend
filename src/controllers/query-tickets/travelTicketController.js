import prisma from "../../config/prisma.js";
import cloudinary from "../../config/cloudinary.js";
import { createActivityAndEmit } from "../../utils/activityHelper.js";
import axios from "axios";

/* ---------------- HELPER ---------------- */
const isValidDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

/* ---------------- UPLOAD HELPER ---------------- */
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const isPDF = file.mimetype === "application/pdf";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "travel_tickets",
        resource_type: isPDF ? "raw" : "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result); // ✅ NO URL MODIFICATION
      }
    );

    stream.end(file.buffer);
  });
};

/* ================= CREATE ================= */
export const createTicket = async (req, res) => {
  try {
    const { person, type, date, from, to, tourId } = req.body;

    if (!person || !type || !from || !to || !tourId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ error: "Valid date is required" });
    }

    let image = null;
    let fileType = null;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file);
      image = uploaded.secure_url;
      fileType = req.file.mimetype;
    }

    const ticket = await prisma.travelTicket.create({
      data: {
        person,
        type,
        date: new Date(date),
        from,
        to,
        tourId,
        image,
        fileType,
      },
    });

    await createActivityAndEmit({
      type: "ticket",
      message: `${type} ticket added for ${person}`,
      tourId,
      performedBy: "System",
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

/* ================= GET ================= */
export const getTicketsByTour = async (req, res) => {
  try {
    const { tourId } = req.params;

    const tickets = await prisma.travelTicket.findMany({
      where: { tourId },
      orderBy: { date: "asc" },
    });

    res.json(tickets);
  } catch (error) {
    console.error("GET TICKETS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

/* ================= UPDATE ================= */
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { person, type, date, from, to } = req.body;

    if (!person || !type || !from || !to) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ error: "Valid date is required" });
    }

    const existing = await prisma.travelTicket.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    let data = {
      person,
      type,
      date: new Date(date),
      from,
      to,
    };

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file);
      data.image = uploaded.secure_url;
      data.fileType = req.file.mimetype;
    }

    const updatedTicket = await prisma.travelTicket.update({
      where: { id },
      data,
    });

    await createActivityAndEmit({
      type: "ticket",
      message: `Ticket updated for ${person}`,
      tourId: existing.tourId,
      performedBy: "System",
    });

    res.json(updatedTicket);
  } catch (error) {
    console.error("UPDATE TICKET ERROR:", error);
    res.status(500).json({ error: "Failed to update ticket" });
  }
};

/* ================= DELETE ================= */
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.travelTicket.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    await prisma.travelTicket.delete({
      where: { id },
    });

    await createActivityAndEmit({
      type: "ticket",
      message: "Ticket deleted",
      tourId: existing.tourId,
      performedBy: "System",
    });

    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("DELETE TICKET ERROR:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
};

/* ================= VIEW PDF (FINAL FIX) ================= */
/* 🔥 THIS FIXES AUTO DOWNLOAD ISSUE */
export const viewTicketFile = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    const response = await axios.get(url, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    response.data.pipe(res);
  } catch (error) {
    console.error("VIEW FILE ERROR:", error);
    res.status(500).json({ error: "Failed to load file" });
  }
};