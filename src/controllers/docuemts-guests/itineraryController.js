import prisma from "../../config/prisma.js";
import { createActivityAndEmit } from "../../utils/activityHelper.js"; // 🔥 ADD


// GET itinerary by tour (UNCHANGED)
export const getItinerary = async (req, res) => {
  try {

    const { tourId } = req.params;

    if (!tourId) {
      return res.status(400).json({
        message: "tourId is required"
      });
    }

    const itinerary = await prisma.itinerary.findMany({
      where: { tourId },
      orderBy: { date: "asc" }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let completedDays = 0;
    let upcomingDays = 0;

    itinerary.forEach(item => {
      if (!item.date) return;

      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate < today) completedDays++;
      else upcomingDays++;
    });

    const totalDays = itinerary.length;

    const progressPercentage =
      totalDays > 0
        ? Math.round((completedDays / totalDays) * 100)
        : 0;

    const startDate = itinerary[0]?.date || null;
    const endDate = itinerary[itinerary.length - 1]?.date || null;

    res.json({
      success: true,
      data: itinerary,
      itinerary,
      stats: {
        totalDays,
        completedDays,
        upcomingDays,
        progressPercentage,
        startDate,
        endDate
      }
    });

  } catch (error) {

    console.error("Get itinerary error:", error);

    res.status(500).json({
      message: "Failed to fetch itinerary"
    });

  }
};


// CREATE itinerary row
export const createItinerary = async (req, res) => {
  try {

    const {
      date,
      destination,
      city,
      hotel,
      roomType,
      status,
      tourId
    } = req.body;

    if (!tourId) {
      return res.status(400).json({
        message: "tourId is required"
      });
    }

    const itinerary = await prisma.itinerary.create({
      data: {
        date: date ? new Date(date) : null,
        destination: destination || null,
        city: city || null,
        hotel: hotel || null,
        roomType: roomType || null,
        status: status || null,
        tourId
      }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "itinerary",
      message: `Itinerary added${destination ? ` - ${destination}` : ""}`,
      tourId,
    });

    res.status(201).json(itinerary);

  } catch (error) {

    console.error("Create itinerary error:", error);

    res.status(500).json({
      message: "Failed to create itinerary"
    });

  }
};


// UPDATE itinerary row
export const updateItinerary = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "id is required"
      });
    }

    const existing = await prisma.itinerary.findUnique({
      where: { id }
    });

    const {
      date,
      destination,
      city,
      hotel,
      roomType,
      status
    } = req.body;

    const itinerary = await prisma.itinerary.update({
      where: { id },
      data: {
        ...(date !== undefined && { date: date ? new Date(date) : null }),
        ...(destination !== undefined && { destination }),
        ...(city !== undefined && { city }),
        ...(hotel !== undefined && { hotel }),
        ...(roomType !== undefined && { roomType }),
        ...(status !== undefined && { status })
      }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "itinerary",
      message: "Itinerary updated",
      tourId: existing.tourId,
    });

    res.json(itinerary);

  } catch (error) {

    console.error("Update itinerary error:", error);

    res.status(500).json({
      message: "Failed to update itinerary"
    });

  }
};


// DELETE itinerary row
export const deleteItinerary = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "id is required"
      });
    }

    const existing = await prisma.itinerary.findUnique({
      where: { id }
    });

    await prisma.itinerary.delete({
      where: { id }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "itinerary",
      message: "Itinerary deleted",
      tourId: existing.tourId,
    });

    res.json({
      message: "Itinerary deleted"
    });

  } catch (error) {

    console.error("Delete itinerary error:", error);

    res.status(500).json({
      message: "Failed to delete itinerary"
    });

  }
};