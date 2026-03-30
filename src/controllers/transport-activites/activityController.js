import prisma from "../../config/prisma.js";
import { v2 as cloudinary } from "cloudinary";


// ==============================
// ✅ GET ALL ACTIVITIES (WITH SELECTION)
// ==============================
export const getActivities = async (req, res) => {
  try {

    const { tourId } = req.query;

    console.log("📥 GET ACTIVITIES | tourId:", tourId);

    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" }
    });

    if (!tourId) {
      return res.json(activities);
    }

    const selected = await prisma.tourActivity.findMany({
      where: { tourId }
    });

    const selectedIds = selected.map(a => a.activityId);

    const result = activities.map(activity => ({
      ...activity,
      isSelected: selectedIds.includes(activity.id)
    }));

    res.json(result);

  } catch (error) {
    console.error("❌ GET ACTIVITIES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// ==============================
// ✅ GET TOUR ACTIVITIES
// ==============================
export const getTourActivities = async (req, res) => {
  try {

    const { tourId } = req.params;

    console.log("📥 GET TOUR ACTIVITIES | tourId:", tourId);

    const data = await prisma.tourActivity.findMany({
      where: { tourId },
      include: {
        activity: true
      }
    });

    res.json(data);

  } catch (error) {
    console.error("❌ GET TOUR ACTIVITIES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// ==============================
// ✅ 🔥 TOGGLE ACTIVITY (MAIN FIX)
// ==============================
export const toggleActivityForTour = async (req, res) => {
  try {

    console.log("📥 TOGGLE REQUEST PARAMS:", req.params);
    console.log("📥 TOGGLE REQUEST BODY:", req.body);

    const { tourId } = req.params;
    const { activityId } = req.body;

    // 🔥 VALIDATION
    if (!tourId) {
      console.error("❌ Missing tourId");
      return res.status(400).json({ message: "Tour ID is required" });
    }

    if (!activityId || typeof activityId !== "string") {
      console.error("❌ Invalid activityId:", activityId);
      return res.status(400).json({ message: "Valid Activity ID required" });
    }

    // 🔍 CHECK EXISTING
    const existing = await prisma.tourActivity.findFirst({
      where: { tourId, activityId }
    });

    console.log("🔍 Existing relation:", existing);

    // ==============================
    // 🔥 REMOVE (DESELECT)
    // ==============================
    if (existing) {

      await prisma.tourActivity.delete({
        where: { id: existing.id }
      });

      console.log("🗑️ Activity removed");

      return res.json({
        message: "Activity removed",
        action: "removed",
        activityId
      });
    }

    // ==============================
    // 🔥 ADD (SELECT)
    // ==============================
    const created = await prisma.tourActivity.create({
      data: {
        tourId,
        activityId
      }
    });

    console.log("✅ Activity added:", created);

    res.json({
      message: "Activity added",
      action: "added",
      activityId
    });

  } catch (error) {

    console.error("❌ TOGGLE ERROR FULL:", error);

    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};


// ==============================
// ✅ SAVE ACTIVITIES (BULK)
// ==============================
export const saveTourActivities = async (req, res) => {
  try {

    console.log("📥 SAVE BULK BODY:", req.body);

    const { tourId } = req.params;
    const { activities } = req.body;

    if (!Array.isArray(activities)) {
      return res.status(400).json({ message: "Activities must be array" });
    }

    await prisma.tourActivity.deleteMany({
      where: { tourId }
    });

    const data = activities.map((id) => ({
      tourId,
      activityId: id
    }));

    await prisma.tourActivity.createMany({
      data,
      skipDuplicates: true
    });

    res.json({ message: "Activities saved successfully" });

  } catch (error) {
    console.error("❌ SAVE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// ==============================
// ✅ CREATE ACTIVITY
// ==============================
export const createActivity = async (req, res) => {
  try {

    console.log("📥 CREATE BODY:", req.body);

    const {
      name,
      description,
      price,
      duration,
      category,
      availability
    } = req.body;

    const image = req.file ? req.file.path : null;

    const activity = await prisma.activity.create({
      data: {
        name,
        description,
        image,
        price: price ? Number(price) : null,
        duration,
        category,
        availability: availability === "true"
      }
    });

    res.json(activity);

  } catch (error) {
    console.error("❌ CREATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// ==============================
// ✅ UPDATE ACTIVITY
// ==============================
export const updateActivity = async (req, res) => {
  try {

    console.log("📥 UPDATE BODY:", req.body);

    const { id } = req.params;

    const {
      name,
      description,
      price,
      duration,
      category,
      availability
    } = req.body;

    const existingActivity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!existingActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    let image = existingActivity.image;

    if (req.file) {

      if (existingActivity.image) {
        const urlParts = existingActivity.image.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `activities/${fileName.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
      }

      image = req.file.path;
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        name,
        description,
        image,
        price: price ? Number(price) : null,
        duration,
        category,
        availability: availability === "true"
      }
    });

    res.json(activity);

  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// ==============================
// ✅ DELETE ACTIVITY
// ==============================
export const deleteActivity = async (req, res) => {
  try {

    console.log("📥 DELETE PARAMS:", req.params);

    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    if (activity.image) {
      const urlParts = activity.image.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const publicId = `activities/${fileName.split(".")[0]}`;

      await cloudinary.uploader.destroy(publicId);
    }

    await prisma.activity.delete({
      where: { id }
    });

    res.json({ message: "Activity deleted successfully" });

  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};