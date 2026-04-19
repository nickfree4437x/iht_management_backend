import prisma from "../../config/prisma.js";
import { v2 as cloudinary } from "cloudinary";


// ==============================
// ✅ GET ACTIVITIES (TOUR SPECIFIC)
// ==============================
export const getActivities = async (req, res) => {
  try {
    const { tourId } = req.query;

    console.log("📥 GET ACTIVITIES | tourId:", tourId);

    if (!tourId) return res.json([]);

    const data = await prisma.tourActivity.findMany({
      where: { tourId },
      include: { activity: true }
    });

    const activities = data
      .filter(item => item.activity)
      .map(item => item.activity);

    return res.json(activities);

  } catch (error) {
    console.error("❌ GET ACTIVITIES ERROR:", error);
    return res.status(500).json({
      message: "Failed to load activities",
      error: error.message
    });
  }
};


// ==============================
// ✅ GET TOUR ACTIVITIES (OPTIONAL USE)
// ==============================
export const getTourActivities = async (req, res) => {
  try {
    const { tourId } = req.params;

    console.log("📥 GET TOUR ACTIVITIES | tourId:", tourId);

    const data = await prisma.tourActivity.findMany({
      where: { tourId },
      include: { activity: true }
    });

    return res.json(data);

  } catch (error) {
    console.error("❌ GET TOUR ACTIVITIES ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};


// ==============================
// ✅ CREATE ACTIVITY (AUTO ASSIGN)
// ==============================
export const createActivity = async (req, res) => {
  try {

    console.log("📥 CREATE BODY:", req.body);

    const {
      name,
      description,
      duration,
      category,
      tourId
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!tourId) {
      return res.status(400).json({ message: "Tour ID is required" });
    }

    const image = req.file ? req.file.path : null;

    // 🔥 Create activity
    const activity = await prisma.activity.create({
      data: {
        name: name.trim(),
        description: description || null,
        image,
        duration: duration || null,
        category: category || null
      }
    });

    // 🔥 Auto assign to tour
    await prisma.tourActivity.create({
      data: {
        tourId,
        activityId: activity.id
      }
    });

    return res.json(activity);

  } catch (error) {
    console.error("❌ CREATE ERROR:", error);
    return res.status(500).json({ error: error.message });
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
      duration,
      category
    } = req.body;

    const existingActivity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!existingActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    let image = existingActivity.image;

    // 🖼️ Replace image if new uploaded
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
        name: name ? name.trim() : existingActivity.name,
        description: description ?? existingActivity.description,
        image,
        duration: duration ?? existingActivity.duration,
        category: category ?? existingActivity.category
      }
    });

    return res.json(activity);

  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};


// ==============================
// 🔥 DELETE ACTIVITY (FORCE DELETE)
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

    // 🔥 Delete all relations first
    await prisma.tourActivity.deleteMany({
      where: { activityId: id }
    });

    // 🔥 Delete image from Cloudinary
    if (activity.image) {
      const urlParts = activity.image.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const publicId = `activities/${fileName.split(".")[0]}`;

      await cloudinary.uploader.destroy(publicId);
    }

    // 🔥 Delete activity
    await prisma.activity.delete({
      where: { id }
    });

    return res.json({ message: "Activity deleted" });

  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};