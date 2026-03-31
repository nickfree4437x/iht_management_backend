import prisma from "../../config/prisma.js";
import cloudinary from "../../config/cloudinary.js";
import { createActivityAndEmit } from "../../utils/activityHelper.js"; // 🔥 ADD

/* ---------------- HELPER ---------------- */
const isValidDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
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

    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "travel_tickets" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      image = uploaded.secure_url;
    }

    const ticket = await prisma.travelTicket.create({
      data: {
        person,
        type,
        date: new Date(date),
        from,
        to,
        tourId,
        image
      }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "ticket",
      message: `${type} ticket added for ${person}`,
      tourId,
      performedBy: "System",
    });

    res.status(201).json(ticket);

  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);

    res.status(500).json({
      error: "Failed to create ticket"
    });
  }
};

/* ================= GET ================= */
export const getTicketsByTour = async (req, res) => {
  try {

    const { tourId } = req.params;

    const tickets = await prisma.travelTicket.findMany({
      where: { tourId },
      orderBy: { date: "asc" }
    });

    res.json(tickets);

  } catch (error) {
    console.error("GET TICKETS ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch tickets"
    });
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

    let data = {
      person,
      type,
      date: new Date(date),
      from,
      to
    };

    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "travel_tickets" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      data.image = uploaded.secure_url;
    }

    const existing = await prisma.travelTicket.findUnique({
      where: { id }
    });

    const updatedTicket = await prisma.travelTicket.update({
      where: { id },
      data
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "ticket",
      message: `Ticket updated for ${person}`,
      tourId: existing.tourId,
    });

    res.json(updatedTicket);

  } catch (error) {
    console.error("UPDATE TICKET ERROR:", error);

    res.status(500).json({
      error: "Failed to update ticket"
    });
  }
};

/* ================= DELETE ================= */
export const deleteTicket = async (req, res) => {
  try {

    const { id } = req.params;

    const existing = await prisma.travelTicket.findUnique({
      where: { id }
    });

    await prisma.travelTicket.delete({
      where: { id }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "ticket",
      message: "Ticket deleted",
      tourId: existing.tourId,
    });

    res.json({
      message: "Ticket deleted successfully"
    });

  } catch (error) {
    console.error("DELETE TICKET ERROR:", error);

    res.status(500).json({
      error: "Failed to delete ticket"
    });
  }
};